// Message detection and processing utilities

import debounce from "../../shared/utils/debounce";
import { estimateTokens } from "../../shared/utils/estimation";
import { detectModel } from "./model";
import { SupportedPlatform } from "./platform";
import { QueryMetric } from "../../shared/types";
import { loadSettings } from "../storage";

// Init time-based variables
let hasStarted: boolean = false;
// let genImage: boolean = false;
let startTime: number = 0;
let firstTokenTime: number = 0;
let lastTokenTime: number = 0;
let hasCodeBlock: boolean = false;
let allowedToTrack: boolean = false;

const debounceDetectModel = debounce((node: Node) => {
  if (!node) return;
  if (!(node instanceof HTMLElement)) return;

  detectModel();
}, 1000);

const setStartTime = () => {
  startTime = Date.now() / 1000;

  // Slight delay to not trigger the final time-based calc step
  setTimeout(() => {
    hasStarted = true;
  }, 100);
};

const addEnterKeyEventListeners = (platform: SupportedPlatform) => {
  const inputElement =
    platform === "chatgpt"
      ? document.getElementById("prompt-textarea")
      : document.querySelector('div.ProseMirror[contenteditable="true"]');

  if (
    !inputElement ||
    inputElement.getAttribute("data-ai-wattch-enter-listener-attached")
  )
    return;

  inputElement.addEventListener("keydown", (event) => {
    if (
      event instanceof KeyboardEvent &&
      event.key === "Enter" &&
      !event.shiftKey &&
      !hasStarted
    ) {
      setStartTime();
    }
  });
  inputElement.setAttribute("data-ai-wattch-enter-listener-attached", "true");
};

const addMessageSendEventListeners = (e: Node, platform: SupportedPlatform) => {
  if (platform === "chatgpt") {
    // Early exit if not a valid HTMLElement
    if (!(e instanceof HTMLElement)) return;

    const testId = e.getAttribute("data-testid");

    if (
      testId === "send-button" &&
      !e.getAttribute("data-ai-wattch-send-listener-attached")
    ) {
      e.setAttribute("data-ai-wattch-send-listener-attached", "true");
      e.addEventListener("click", setStartTime);
    }
  } else if (platform === "claude") {
    const btn = document.querySelector('button[aria-label="Send message"]');
    // Or use some selector that best matches it
    if (
      btn &&
      btn instanceof HTMLElement &&
      !btn.getAttribute("data-ai-wattch-send-listener-attached")
    ) {
      btn.setAttribute("data-ai-wattch-send-listener-attached", "true");
      btn.addEventListener("click", setStartTime);
    }
  }
};

const setFirstTokenTime = (e: Node, platform: SupportedPlatform) => {
  if (
    platform === "chatgpt" &&
    e instanceof HTMLElement &&
    e.getAttribute("data-message-author-role") === "assistant"
  ) {
    // setting has started true here as well since we tracking retry and all
    if (!hasStarted) {
      setStartTime();
    }
    firstTokenTime = Date.now() / 1000;
  } else if (
    platform === "claude" &&
    e instanceof HTMLElement &&
    e.querySelector(".font-claude-response") !== null
  ) {
    // setting has started true here as well since we tracking retry and all
    // if (!hasStarted) {
    //   setStartTime();
    // }
    firstTokenTime = Date.now() / 1000;
  }
};

const setLastTokenTime = () => {
  lastTokenTime = Date.now() / 1000;
};

const checkIfResponseCompleted = (node: Node, platform: SupportedPlatform) => {
  // Adding special case: when the submit button is disabled again and user types something the data-state does not change
  if (
    hasStarted &&
    node instanceof SVGElement &&
    platform === "chatgpt" &&
    node.tagName === "svg"
  ) {
    if (
      node.parentElement?.getAttribute("data-testid") === "send-button" &&
      node.parentElement?.getAttribute("aria-label") === "Send prompt"
    ) {
      return true;
    }
  }

  if (!hasStarted || !(node instanceof HTMLElement)) {
    console.log("DEBUG: Came here 1");
    return false;
  }

  if (!node.children[0]) {
    console.log("DEBUG: Came here 2");
    return false;
  }

  // adding one more additional check since in claude due some change data-state closed is available on some other element as well
  if (
    node.children[0].getAttribute("data-state") === "closed" &&
    node.tagName !== "LI"
  ) {
    console.log("DEBUG: Came here 3");
    return true;
  }

  if (platform === "chatgpt") {
    return (
      node.getAttribute("data-testid") === "composer-speech-button-container" &&
      (node.children[0].getAttribute("data-state") === "closed" ||
        node.children[0]?.children?.[0].getAttribute("data-state") === "closed")
    );
  } else if (platform === "claude") {
    return (
      node.children[0].getAttribute("data-state") === "closed" &&
      node.children[0].children[0] &&
      node.children[0].children[0].getAttribute("disabled") === "true"
    );
  }
};

const checkIfCodeBlock = (node: Node) => {
  if (!node) return;
  if (!(node instanceof HTMLElement)) return;
  if (node.classList.contains("token")) {
    hasCodeBlock = true;
  }
};

const ProcessResponse = (platform: SupportedPlatform) => {
  const sendObject = {
    startTime,
    firstTokenTime,
    lastTokenTime,
    outputTokens: 0,
    inputTokens: 0,
    inputTextLength: 0,
    outputTextLength: 0,
    platform,
  };
  if (platform === "chatgpt") {
    console.log("DEBUG: Came here 5");
    const allNodes = document.querySelectorAll("article");

    if (allNodes.length !== 0) {
      const outputNode = allNodes[allNodes.length - 1];
      console.log("DEBUG: Came here 6", { outputNode });
      const outputText = outputNode.innerText.replace("ChatGPT said:", "");
      const inputNode = allNodes[allNodes.length - 2];
      const inputText = inputNode.innerText.replace("You said:", "");

      const outputTokens = estimateTokens(outputText || "");
      const inputTokens = estimateTokens(inputText || "");

      sendObject.outputTokens = outputTokens;
      sendObject.inputTokens = inputTokens;
      sendObject.inputTextLength = inputText.length;
      sendObject.outputTextLength = outputText.length;

      console.log("👁️ AI Wattch: outputText, inputText", {
        outputText,
        inputText,
      });
      return sendObject;
    }
  } else if (platform === "claude") {
    const allOutputNode = document.querySelectorAll(
      ".font-claude-response"
    ) as NodeListOf<HTMLElement>;
    const allInputNode = document.querySelectorAll(
      "[data-testid='user-message']"
    ) as NodeListOf<HTMLElement>;

    if (allOutputNode.length !== 0 && allInputNode.length !== 0) {
      const codeBlocks = hasCodeBlock
        ? (document.querySelectorAll(
            ".code-block__code"
          ) as NodeListOf<HTMLElement>)
        : [];

      if (codeBlocks.length) {
        const codeBlock = codeBlocks[codeBlocks.length - 1];

        const codeBlockText = codeBlock.innerText;
        const codeBlockTokens = estimateTokens(codeBlockText || "");
        sendObject.outputTokens += codeBlockTokens;
      }
      // the last output node is the second to last as last one is selector
      const outputNode = allOutputNode[allOutputNode.length - 2];
      const inputNode = allInputNode[allInputNode.length - 1];
      const outputText = outputNode.innerText;
      const inputText = inputNode.innerText;
      console.log("👁️ AI Wattch: outputText, inputText", {
        outputText,
        inputText,
      });
      const outputTokens = estimateTokens(outputText || "");
      const inputTokens = estimateTokens(inputText || "");

      sendObject.outputTokens += outputTokens;
      sendObject.inputTokens = inputTokens;
      sendObject.inputTextLength = inputText.length;
      sendObject.outputTextLength = outputText.length;

      return sendObject;
    }
  }

  return sendObject;
};

// Monitor for new messages with enhanced detection
export const createMessageObserver = (
  platform: SupportedPlatform,
  onNewMessage: (message: QueryMetric) => void
): MutationObserver => {
  console.log("👁️ AI Wattch: Creating message observer", { platform });

  const observer = new MutationObserver(async (mutations) => {
    // Check if model changes

    if (!allowedToTrack) {
      const settings = await loadSettings();
      allowedToTrack = !!settings.allowedToTrack;
    }

    if (!allowedToTrack) return;

    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        if (
          platform === "claude" &&
          [...document.querySelectorAll('[class="text-sm"]')].find((e) =>
            e.textContent.includes("Session limit reached")
          )
        ) {
          console.log("Hellooooo");
          return;
        }
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            console.log(node);
            debounceDetectModel(node);
            addEnterKeyEventListeners(platform);
            addMessageSendEventListeners(node, platform);
            setFirstTokenTime(node, platform);
            checkIfCodeBlock(node);

            // Wait until the "submit" button is available again

            console.log({
              hasStarted,
              startTime,
              firstTokenTime,
              lastTokenTime,
            });

            if (checkIfResponseCompleted(node, platform)) {
              hasStarted = false;
              console.log("DEBUG: 👁️ AI Wattch: Response completed detected");

              // if (
              //   node.children[0] &&
              //   node.children[0].getAttribute("data-state") === "closed"
              // ) {
              setLastTokenTime();

              const sendObject = ProcessResponse(platform);

              onNewMessage(sendObject);
            }
            // }
          });
        }
      }
    });
  });

  return observer;
};

// const checkIsMessage = (node: Node) => {
//   if (node.nodeType === 1) {
//     const element = node as HTMLElement;
//     console.log("👁️ AI Wattch: Processing element", element.tagName);
//   }
// };
