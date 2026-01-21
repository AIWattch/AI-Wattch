import React, { useRef, useState } from "react";

import { Card } from "../../shared/components/Card";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { ArrowLeftIcon } from "../../icons/ArrowLeftIcon";
import TipsIcon from "../../icons/TipsIcon";

interface Tip {
  id: string;
  title: string;
  content: string | React.ReactNode;
  category: "CLARITY" | "PROMPTS" | "TONE" | "CODING";
  isExpanded: boolean;
}

export const TipsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [tips, setTips] = useState<Tip[]>([
    {
      id: "1",
      title: "Be specific",
      content: (
        <>
          Clearly state what you want in your prompt{" "}
          <span className="text-glacier-600">
            (e.g., "Summarize in 3 bullet points"{" "}
          </span>{" "}
          instead of just "Summarize") . This reduces back-and-forth and saves
          energy.
        </>
      ),
      category: "CLARITY",
      isExpanded: true,
    },
    {
      id: "2",
      title: "Set boundaries",
      content: (
        <>
          <span className="text-glacier-600">“In under 200 words”</span> instead
          of keeping it vague.
        </>
      ),
      category: "PROMPTS",
      isExpanded: false,
    },
    {
      id: "3",
      title: "Skip polite fillers",
      content: (
        <>
          <span className="text-glacier-600">
            Avoid words like please, kindly, or thank you
          </span>{" "}
          as they add extra tokens.
        </>
      ),
      category: "TONE",
      isExpanded: false,
    },
    {
      id: "4",
      title: "Be specific about the output",
      content: (
        <>
          <span className="text-glacier-600">
            “Python function for factorial”
          </span>{" "}
          instead of “Write me some code about factorials.”
        </>
      ),
      category: "CODING",
      isExpanded: false,
    },
  ]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const filters = ["ALL", "PROMPTS", "CLARITY", "TONE", "CODING"];

  const toggleTip = (id: string) => {
    setTips(
      tips.map((tip) =>
        tip.id === id ? { ...tip, isExpanded: !tip.isExpanded } : tip
      )
    );
  };

  const getFilteredTips = (filter: string) =>
    filter === "ALL" ? tips : tips.filter((tip) => tip.category === filter);

  const filteredTips = getFilteredTips(activeFilter);
  const onFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    if (filter === "ALL") {
      setTips(
        tips.map((tip, index) =>
          index === 0
            ? { ...tip, isExpanded: true }
            : { ...tip, isExpanded: false }
        )
      );
    } else {
      setTips(
        tips.map((tip) =>
          tip.category === filter
            ? { ...tip, isExpanded: true }
            : { ...tip, isExpanded: false }
        )
      );
    }

    const buttonElement = buttonRefs.current[filter];
    if (buttonElement && scrollContainerRef.current) {
      buttonElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center", // This centers the button horizontally
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "CLARITY":
        return "#9676CE";
      case "PROMPTS":
        return "#24BD6E";
      case "TONE":
        return "#F06293";
      case "CODING":
        return "#FF7040";
      default:
        return "bg-grey-500";
    }
  };

  return (
    <div>
      {/* <div className=""> */}
      <button
        onClick={onBack}
        className="text-grey-600 w-full cursor-pointer  transition-colors flex items-center gap-2  py-2  border-b border-grey-200"
      >
        <ArrowLeftIcon size={12} />

        <h1 className="text-sm font-normal text-obsidian font-outfit">
          Tips to improve prompts
        </h1>
      </button>

      {/* </div> */}

      <div
        ref={scrollContainerRef}
        className="flex gap-1 overflow-x-auto hide-scrollbar max-w-full my-2"
      >
        {filters.map((filter) => (
          <button
            key={filter}
            ref={(el) => (buttonRefs.current[filter] = el)}
            onClick={() => onFilterSelect(filter)}
            className={`px-2 py-1 rounded-full text-10 font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeFilter === filter
                ? "bg-midnight-ocean-500 text-white"
                : "bg-grey-100 text-grey-500 hover:bg-grey-200"
            }`}
          >
            <span className="relative top-[0.5px]">{filter}</span>
          </button>
        ))}
      </div>

      {/* Filter Buttons */}

      {/* Tips List */}
      <div className="space-y-3 h-full  pb-3" style={{ minHeight: "400px" }}>
        {filteredTips.map((tip) => (
          <div key={tip.id} className="space-y-2">
            <div
              className={` pl-[1px] pr-[6px] py-[1px] gap-1 rounded-full flex items-center text-10 font-semibold text-white w-max`}
              style={{
                backgroundColor: getCategoryColor(tip.category),
              }}
            >
              <TipsIcon type={tip.category} />
              {tip.category}
            </div>

            <div
              className="bg-mist rounded-lg p-3 cursor-pointer"
              onClick={() => toggleTip(tip.id)}
            >
              <div className=" flex items-start gap-2 text-obsidian">
                <div className="">
                  <ChevronDownIcon
                    variant="bold"
                    size={10}
                    className={`inline-block relative top-[-2px] transition-transform ${
                      tip.isExpanded ? "rotate-[-90deg]" : ""
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium  ">{tip.title}</h3>
                  {tip.isExpanded && (
                    <div className="mt-1 text-xs  text-grey-600 ">
                      {tip.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
