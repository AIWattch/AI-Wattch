import { SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, CloseIcon } from "../../icons";
import Input from "./Input";

const CustomSelect = ({
  value,
  onSelect,
  options,
  quickOptions = [],
  searchPlaceholder,
  renderOption,
  renderSelected,
}: {
  value: any;
  onSelect: (option: any) => void;
  options: any[];
  quickOptions?: any[];
  searchPlaceholder: string;
  renderOption: (option: any) => React.ReactNode;
  renderSelected: (option: any) => React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filterOptions = (options: any[]) =>
    options.filter(
      (option) =>
        option.countryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.modelName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredOptions = filterOptions(options);

  const filteredQuickOption = filterOptions(quickOptions);

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     console.log(event, "sfvsdonvson");
  //     if (
  //       dropdownRef.current &&
  //       !dropdownRef.current.contains(event.target as Node) &&
  //       buttonRef.current &&
  //       !buttonRef.current.contains(event.target as Node)
  //     ) {
  //       setIsOpen(false);
  //       setSearchTerm("");
  //     }
  //   };

  //   if (isOpen) {
  //     // Add a small delay to prevent immediate closure
  //     setTimeout(() => {
  //       document.addEventListener("mousedown", handleClickOutside);
  //     }, 100);
  //   }

  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Get all elements in the event path (works with shadow DOM)
      const path = event.composedPath();

      // Check if click is outside both dropdown and button
      const clickedOutside =
        dropdownRef.current &&
        !path.includes(dropdownRef.current) &&
        buttonRef.current &&
        !path.includes(buttonRef.current);

      if (clickedOutside) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  const handleSelect = (option: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleOptionClick = (option: any) => (e: React.MouseEvent) => {
    handleSelect(option, e);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="w-full h-8 px-3 flex items-center justify-between bg-white rounded-full text-sm text-obsidian hover:bg-grey-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {value ? renderSelected(value) : "Select"}
        </div>

        <ChevronDownIcon
          size={8}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          style={{
            boxShadow: "0px 2px 10px 0px #00000033",
          }}
          className="absolute py-3 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl z-50 max-h-60 overflow-hidden"
        >
          <div className="px-3">
            <div className="relative bg-white">
              <SearchIcon
                size={20}
                className="text-grey-500 absolute left-[5px] top-1/2 transform -translate-y-1/2"
              />

              <Input
                type="text"
                name="search"
                value={searchTerm}
                onChange={(e) => {
                  e.stopPropagation(); // Prevent bubbling to host page
                  setSearchTerm(e.target.value);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation(); // Stop all keyboard events too
                }}
                onKeyUp={(e) => {
                  e.stopPropagation();
                }}
                onInput={(e) => {
                  e.stopPropagation();
                }}
                placeholder={searchPlaceholder}
                className="w-full px-8 font-normal placeholder:font-normal py-1.5 bg-white text-grey-600 placeholder:text-grey-500 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-[1px] focus:ring-glacier-500 focus:border-transparent"
                autoFocus
              />
              {searchTerm && (
                <button
                  className="absolute right-[5px] top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                >
                  <CloseIcon size={20} />
                </button>
              )}
            </div>
          </div>
          <div className="px-[4px]">
            <div className="max-h-48 mt-2 overflow-y-auto custom-scrollbar ">
              <div className="pl-1 pr-2">
                {filteredQuickOption.map((option, index) => (
                  <button
                    className="w-full "
                    key={index}
                    onClick={handleOptionClick(option)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent focus issues
                  >
                    {renderOption(option)}
                  </button>
                ))}
                {filteredQuickOption.length > 0 ? (
                  <div
                    className="w-full my-1.5 border-b border-[#1C1C1C]"
                    style={{ opacity: 0.1 }}
                  />
                ) : null}
                {filteredOptions.map((option, index) => (
                  <button
                    className="w-full "
                    key={index}
                    onClick={handleOptionClick(option)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent focus issues
                  >
                    {renderOption(option)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { CustomSelect };
