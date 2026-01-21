import React, { useEffect, useRef, useState } from "react";
import { CloseIcon } from "../../icons";
import Input, { TextArea } from "../../shared/components/Input";
import { MESSAGE_TYPES } from "../../constants/appEvents";
import { sendToBackground } from "../../core/api";

interface ShareFeedbackModalProps {
  onClose: () => void;
}

export const ShareFeedbackModal: React.FC<ShareFeedbackModalProps> = ({
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
  });
  const [errors, setErrors] = useState({ email: "" });

  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.feedback.trim() &&
    !errors.email;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const validateEmail = (email: string) => {
    // Simple, reliable email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleBlur = () => {
    if (!validateEmail(formData.email) && formData.email) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
    }
  };

  const handleSendEmail = async () => {
    if (!isFormValid || loading) return;
    setLoading(true);

    try {
      // ✅ Move logic to background script via Message Passing
      const response = await sendToBackground<{
        success: boolean;
        error?: string;
      }>({
        type: MESSAGE_TYPES.SUBMIT_FEEDBACK,
        data: formData,
      });

      if (response && response.success) {
        setFormData({ name: "", email: "", feedback: "" });
        onClose();
      } else {
        throw new Error(response?.error || "Failed to send via background");
      }
    } catch (error) {
      console.error("EmailJS failed, falling back to mailto:", error);
      // 📨 Fallback to default mail client
      const subject = encodeURIComponent("Feedback from " + formData.name);
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nFeedback:\n${formData.feedback}`,
      );
      window.location.href = `mailto:pascal@itclimateed.com?subject=${subject}&body=${body}`;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (inputRef) {
      inputRef.current?.focus();
    }
  }, [formData.name]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      style={{ zIndex: 2147483649 }}
      onClick={onClose}
    >
      <div
        style={{
          boxShadow: "0px 2px 10px 0px #00000033",
          borderWidth: "0.2px",
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border-glacier-500 w-[350px] p-4 space-y-3"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-obsidian">Share Feedback</h2>
          <button
            onClick={onClose}
            className="hover:bg-grey-100 rounded-lg transition-colors p-1"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="w-full h-[1px] bg-grey-200 rounded" />

        {/* Content */}
        <div className="bg-mist rounded-lg p-3 space-y-2">
          <h3 className="text-sm font-medium text-obsidian">
            We'd love to hear from you!
          </h3>
          <p className="text-xs font-normal text-grey-600">
            Facing problems or got some feedback? Fill this out and we’ll get
            back to you.
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-2">
          <Input
            autoFocus
            name="name"
            placeholder="Your Name"
            value={formData.name}
            forceFocus={true}
            onChange={handleChange}
            onKeyDown={(e) => {
              e.stopPropagation(); // Stop all keyboard events too
            }}
            className="w-full h-8 border bg-white border-grey-500 rounded-lg px-2 text-sm text-obsidian focus:outline-none focus:border-glacier-500 placeholder-grey-500"
          />

          {/* <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your Name"
            autoComplete="off"
          /> */}

          <div>
            <Input
              name="email"
              type="email"
              placeholder="Your Email"
              onKeyDown={(e) => e.stopPropagation()}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full h-8 border bg-white rounded-lg px-2 text-sm text-obsidian focus:outline-none placeholder-grey-500 ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-grey-500 focus:border-glacier-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <TextArea
            autoFocus={false}
            name="feedback"
            placeholder="Your Feedback"
            onKeyDown={(e) => {
              e.stopPropagation(); // Stop all keyboard events too
            }}
            value={formData.feedback}
            onChange={handleChange}
            rows={3}
            className="w-full border custom-scrollbar bg-white border-grey-500 rounded-lg px-2 py-1 text-sm text-obsidian focus:outline-none focus:border-glacier-500 placeholder-grey-500 resize-none"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSendEmail}
            disabled={!isFormValid || loading}
            className={`w-full h-8 rounded-full text-sm border transition-colors ${
              isFormValid
                ? "bg-glacier-500 hover:bg-glacier-600 text-midnight-ocean-500 border-midnight-ocean-400"
                : "bg-grey-200 text-grey-500 border-grey-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Sending..." : "Send Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
};
