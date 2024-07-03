import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./index.module.css";

const SearchBar = ({ users, onSelectUser, selectedUser }) => {
  const [query, setQuery] = useState(selectedUser ? selectedUser.name : "");
  const [filteredData, setFilteredData] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [lastInteraction, setLastInteraction] = useState(null);
  const resultsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const handleInputChange = ({ target: { value } }) => {
    setQuery(value);
    debounceFilterUsers(value);
  };

  const filterUsers = (query) => {
    if (!query) {
      setFilteredData([]);
      return;
    }
    const results = users.filter((user) => {
      return (
        user.id.toString().includes(query) ||
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.items.some((item) =>
          item.toLowerCase().includes(query.toLowerCase())
        ) ||
        user.address.toLowerCase().includes(query.toLowerCase()) ||
        user.pincode.includes(query)
      );
    });
    setFilteredData(results);
    setHighlightedIndex(-1);
  };

  const debounceFilterUsers = useCallback(
    (query) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        filterUsers(query);
        debounceTimeoutRef.current = null;
      }, 150);
    },
    [filterUsers]
  );

  const handleKeyDown = ({ key }) => {
    if (key === "ArrowDown") {
      setHighlightedIndex((prevIndex) => (prevIndex + 1) % filteredData.length);
      setLastInteraction("keyboard");
    } else if (key === "ArrowUp") {
      setHighlightedIndex((prevIndex) =>
        prevIndex === 0 ? filteredData.length - 1 : prevIndex - 1
      );
      setLastInteraction("keyboard");
    } else if (key === "Enter" && highlightedIndex >= 0) {
      onSelect(filteredData[highlightedIndex]);
    }
  };

  const handleMouseEnter = (index) => {
    if (lastInteraction !== "keyboard") {
      setTimeout(() => {
        setHighlightedIndex(index);
        setLastInteraction("mouse");
      }, 50);
    }
  };

  const handleMouseLeave = () => {
    if (lastInteraction !== "keyboard") {
      setHighlightedIndex(-1);
    }
  };

  const onSelect = (user) => {
    onSelectUser(user);
    setFilteredData([user]);
    setLastInteraction(null);
    setHighlightedIndex(-1);
  };

  const highlightText = (text, highlight) => {
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className={styles.highlightedText}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const onMouseOver = () => {
    setLastInteraction(null);
  };

  useEffect(() => {
    if (selectedUser) {
      setQuery(selectedUser.name);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (highlightedIndex >= 0 && filteredData.length > 0) {
      const highlightedItem = resultsRef.current.children[highlightedIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, filteredData]);

  return (
    <div className={styles.searchBox}>
      <div
        className={`${styles.searchInputContainer} ${
          query ? "" : styles.noBorder
        }`}
      >
        <svg
          className={styles.searchIcon}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search users by ID, address, name..."
          className={styles.searchInput}
          onBlur={onMouseOver}
        />
      </div>
      {query && (
        <div
          onMouseOver={onMouseOver}
          className={styles.results}
          ref={resultsRef}
        >
          {filteredData.length === 0 ? (
            <div className={styles.emptyCard}>No results found</div>
          ) : (
            filteredData.map((user, index) => (
              <div
                key={user.id}
                className={`${styles.userCard} ${
                  highlightedIndex === index ? styles.highlighted : ""
                }`}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onSelect(user)}
              >
                <div className={styles.title}>
                  <p className={styles.userId}>
                    {highlightText(user.id, query)}
                  </p>
                  <p>{highlightText(user.name, query)}</p>
                </div>
                {user.items.some((item) =>
                  item.toLowerCase().includes(query.toLowerCase())
                ) && (
                  <p
                    className={styles.itemResult}
                  >{`"${query}" found in items`}</p>
                )}
                <p className={styles.address}>
                  {highlightText(user.address, query)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
