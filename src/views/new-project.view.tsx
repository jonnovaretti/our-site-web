import {
  ChangeEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

async function buildIframeDocument(): Promise<string> {
  const response = await fetch("http://localhost:5173/template1/index.html");
  const htmlText = await response.text();

  return htmlText;
}

type ELEMENT_TYPE = "text" | "image";

const getHtmlElementFromIFrame = (
  iframeRef: RefObject<HTMLIFrameElement>,
  elementId: string,
): HTMLImageElement | HTMLElement => {
  const iframe = iframeRef.current;

  if (!iframe) throw new Error("IFrame was not found");

  const iframeWindow = iframe.contentWindow;
  if (!iframeWindow) throw new Error("IFrame window was not found");

  const targetElement = iframeWindow.document.getElementById(elementId);
  if (!targetElement) throw new Error(`Element ${elementId} was not found`);

  return targetElement;
};

function NewProjectView() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeContent, setIFrameContent] = useState("");
  const fieldsValues = useMemo(() => new Map(), []);
  const [currentElementId, setCurrentElementId] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [elementType, setElementType] = useState<ELEMENT_TYPE>("text");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = event.target.value;

    setCurrentValue(value);

    const targetElement = getHtmlElementFromIFrame(iframeRef, currentElementId);

    targetElement.innerText = value;
    fieldsValues.set(currentElementId, value);
    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    const targetElement = getHtmlElementFromIFrame(
      iframeRef,
      currentElementId,
    ) as HTMLImageElement;

    targetElement.src = previewUrl;
    fieldsValues.set(currentElementId, previewUrl);
    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const focusOnEditor = useCallback(
    ({
      elementId,
      elementType,
    }: {
      elementId: string;
      elementType: ELEMENT_TYPE;
    }) => {
      const targetElement = getHtmlElementFromIFrame(iframeRef, elementId);

      if (!targetElement) return;

      setElementType(elementType);
      setCurrentElementId(elementId);
      setCurrentValue(targetElement.innerText);

      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    },
    [iframeRef],
  );

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "FOCUS_ON_EDITOR") {
        console.log(event.data);

        focusOnEditor({
          elementId: event.data.payload.elementId,
          elementType: event.data.payload.elementType,
        });
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [focusOnEditor]);

  useEffect(() => {
    const loadTemplateContent = async () => {
      const htmlTemplateContent = await buildIframeDocument();
      setIFrameContent(htmlTemplateContent);
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

        {elementType === "text" ? (
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
        ) : (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Logo
            </label>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
          </div>
        )}
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
