import {
  ChangeEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@material-tailwind/react";

type ELEMENT_TYPE = "text" | "image";

function NewProjectView() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeContent, setIFrameContent] = useState("");
  const fieldsValues = useMemo(() => new Map(), []);
  const [currentElementId, setCurrentElementId] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [elementType, setElementType] = useState<ELEMENT_TYPE>("text");

  async function buildIframeDocument(): Promise<string> {
    const response = await fetch("http://localhost:5173/template1/index.html");
    const htmlText = await response.text();

    return htmlText;
  }

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

  const publish = useCallback(() => {
    alert("here");
  }, []);

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
    <div className="flex h-screen font-sans">
      {/* LEFT PANEL — Editor */}
      <div className="flex-1 border-r border-gray-300 p-4 box-border">
        <Button>Test</Button>
        <aside className="w-full bg-gray-200 shadow-sm"></aside>
        <div className="p-5">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Editor</h2>
          </div>

          {elementType === "text" ? (
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Field</label>
              <textarea
                cols={10}
                rows={5}
                value={currentValue}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — Iframe Preview */}
      <div className="flex-[2] h-5/6 p-4 box-border overflow-hidden bg-gray-50">
        <iframe
          sandbox="allow-same-origin allow-scripts"
          id="myIFrame"
          ref={iframeRef}
          title="Site preview"
          srcDoc={iframeContent}
          className="w-full h-full border border-gray-300 rounded-lg bg-white"
        />
      </div>
    </div>
  );
}

export default NewProjectView;
