import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type SiteFormValues = {
  title: string;
  subtitle: string;
  mainContent: string; // user-provided HTML
  logoFile?: File | null;
  logoUrl?: string;
};

/**
 * Wrap body HTML into a full HTML document for the iframe.
 * Here you can:
 *  - Add external CSS <link> tags (CDN / template CSS)
 *  - Add JS (template scripts, analytics, etc.)
 */
async function buildIframeDocument(): Promise<string> {
  const response = await fetch("http://localhost:5173/template1/index.html");
  const htmlText = await response.text();

  return htmlText;
}

function NewProjectView() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeContent, setIFrameContent] = useState("");
  const fieldsValues = useMemo(() => new Map(), []);
  const [currentElementId, setCurrentElementId] = useState("");
  const [currentValue, setCurrentValue] = useState("");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = event.target.value;

    setCurrentValue(value);

    fieldsValues.set(currentElementId, value);

    const iframe = document.getElementById("myIFrame");
    const iframeWindow = iframe.contentWindow;
    const targetElement = iframeWindow.document.querySelector(
      `#${currentElementId}`,
    );

    if (targetElement) {
      targetElement.innerText = value;
    }

    console.log(fieldsValues);
  };

  useEffect(() => {
    const loadTemplateContent = async () => {
      const htmlTemplateContent = await buildIframeDocument();
      setIFrameContent(htmlTemplateContent);
    };

    (window as any).focusOnEditor = (elementId: string) => {
      // do whatever you want here
      const iframe = document.getElementById("myIFrame");
      const iframeWindow = iframe.contentWindow;
      const targetElement = iframeWindow.document.querySelector(
        `#${elementId}`,
      );

      if (targetElement) {
        setCurrentElementId(elementId);
        setCurrentValue(targetElement.innerText);
      }
    };

    loadTemplateContent();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* LEFT PANEL — Editor */}
      <div
        style={{
          flex: 1,
          borderRight: "1px solid #ddd",
          padding: "1rem",
          boxSizing: "border-box",
        }}
      >
        <h2>Page Editor</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Field
          </label>
          <input
            type="text"
            value={currentValue}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem" }}
            placeholder="My Pizza Shop"
          />
        </div>
      </div>

      {/* RIGHT PANEL — Iframe Preview */}
      <div
        style={{
          flex: 2,
          padding: "1rem",
          boxSizing: "border-box",
          overflow: "hidden",
          backgroundColor: "#fafafa",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Preview</h2>

        <iframe
          // allow-same-origin + allow-scripts lets template JS run,
          // but still keeps it sandboxed away from your app
          sandbox="allow-same-origin allow-scripts"
          id="myIFrame"
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "white",
          }}
          title="Site preview"
          srcDoc={iframeContent}
          ref={iframeRef}
        />
      </div>
    </div>
  );
}

export default NewProjectView;
