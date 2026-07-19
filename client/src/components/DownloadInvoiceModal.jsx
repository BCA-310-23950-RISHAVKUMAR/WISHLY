import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { generateInvoicePDF } from "../utils/pdfGenerator";

const DownloadInvoiceModal = ({ order, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const modalRef = useRef(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent scroll on body when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    const orderId = order._id ? order._id.toUpperCase().slice(-6) : "Unknown";
    const toastId = toast.loading(`Generating PDF invoice for order #${orderId}...`, {
      theme: "dark"
    });

    try {
      await generateInvoicePDF(order);
      toast.update(toastId, {
        render: "PDF invoice downloaded successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: "Failed to download PDF invoice. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const orderShortId = order?._id ? order._id.toUpperCase().slice(-6) : "";

  return (
    <div className="download-modal-overlay" onClick={handleBackdropClick}>
      <div className="download-modal-container reveal" ref={modalRef} role="dialog" aria-modal="true">
        <div className="download-modal-header">
          <h3>Confirm Download</h3>
          <button type="button" className="download-modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="download-modal-body">
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
            <div className="option-icon-wrapper pdf" style={{ background: "var(--purple)", color: "white" }}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M9 15h1a2 2 0 0 0 0-4H9v4Z" />
                <path d="M12 11v4" />
                <path d="M15 11v4" />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem" }}>Invoice PDF Document</p>
              <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                Perfect print layout copy for Order #{orderShortId}
              </p>
            </div>
          </div>

          <p className="download-modal-confirmation">
            Are you sure you want to download this PDF document?
          </p>
        </div>

        <div className="download-modal-actions">
          <button type="button" className="ghost-btn" onClick={onClose} disabled={downloading}>
            Cancel
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleDownload}
            disabled={downloading}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            {downloading ? (
              <>
                <span className="spinner"></span>
                Downloading...
              </>
            ) : (
              "Confirm & Download"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadInvoiceModal;
