import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchIcon, X } from "lucide-react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { Avatar } from "@heroui/react";
import { Place } from "@/app/page";

interface SearchProps {
  items: Place[];
  onSelectionChange: () => void;
  onInputChange: (value: string) => void;
  placeholder?: string;
  onSelectedPlace: (place: Place) => void;
}

export function OptimizedImage(props: ImageProps) {
  return (
    <Image
      {...props}
      alt="Place Image"
      width={30}
      height={30}
      quality={20}
      loading="eager"
    />
  );
}

export function Search({
  items,
  onSelectionChange,
  onInputChange,
  placeholder = "Search places...",
  onSelectedPlace,
}: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<Place[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredItems]);

  // Filter items based on search query
  useEffect(() => {
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
    onInputChange(searchQuery);
  }, [searchQuery, items, onInputChange]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add this effect to handle scrolling
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownListRef.current) {
      const dropdown = dropdownListRef.current;
      const selectedItem = dropdown.children[selectedIndex] as HTMLElement;

      if (selectedItem) {
        const dropdownRect = dropdown.getBoundingClientRect();
        const selectedItemRect = selectedItem.getBoundingClientRect();

        // Check if the selected item is not fully visible
        if (selectedItemRect.bottom > dropdownRect.bottom) {
          // Scroll down if item is below viewport
          dropdown.scrollTop += selectedItemRect.bottom - dropdownRect.bottom;
        } else if (selectedItemRect.top < dropdownRect.top) {
          // Scroll up if item is above viewport
          dropdown.scrollTop -= dropdownRect.top - selectedItemRect.top;
        }
      }
    }
  }, [selectedIndex]);

  const handleItemSelect = (item: Place) => {
    setSearchQuery(item.name);
    setIsOpen(false);
    onSelectionChange();
    onSelectedPlace(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
          handleItemSelect(filteredItems[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsOpen(false);
    onInputChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-2xl">
      <div
        className={cn(
          "flex items-center w-full rounded-full border-2 border-gray-200",
          "bg-background px-4 h-[48px]",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        )}
      >
        <SearchIcon className="text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-hidden ml-2 text-foreground"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && filteredItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute w-full mt-2 bg-background border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
          >
            <div
              ref={dropdownListRef}
              className="max-h-[320px] overflow-y-auto scroll-smooth"
            >
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleItemSelect(item)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 cursor-pointer",
                    "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                    selectedIndex === index && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <div className="shrink-0">
                    <Avatar
                      alt={item.name}
                      className="shrink-0"
                      size="sm"
                      src={item.image}
                      imgProps={{ loading: "eager" , width: 30, height: 30}}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-gray-500">
                      {item.locality}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
