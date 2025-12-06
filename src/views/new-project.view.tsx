import React, { useState, useMemo, ChangeEvent, useEffect } from "react";
import DOMPurify from "dompurify";

type SiteFormValues = {
  title: string;
  subtitle: string;
  mainContent: string; // user-provided HTML
  logoFile?: File | null;
  logoUrl?: string;
};

// Escape plain text fields so they don't break HTML
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Body HTML template (without <html> / <head> / <body>)
const baseBodyTemplate = `
  <div class="page">
    <header class="page-header">
      <h1>{{title}}</h1>
      <h2>{{subtitle}}</h2>

      {{#if logoUrl}}
        <img src="{{logoUrl}}" alt="Logo" class="logo" />
      {{/if}}
    </header>

    <main class="page-content">
      {{mainContent}}
    </main>
  </div>
`.trim();

/**
 * Only sanitize:
 *  - mainContent (user HTML)
 * Escape:
 *  - title, subtitle (plain text)
 * Trust:
 *  - logoUrl from URL.createObjectURL (blob URL)
 */
function buildBodyHtml(values: SiteFormValues): string {
  const safeMainContent = DOMPurify.sanitize(
    values.mainContent ||
      "<p>Write your HTML content here and see the preview on the right.</p>",
  );

  const titleText = values.title.trim() || "My Awesome Business";
  const subtitleText = values.subtitle.trim() || "Your slogan here";

  let result = baseBodyTemplate;

  const replacements: Record<string, string> = {
    "{{title}}": escapeHtml(titleText),
    "{{subtitle}}": escapeHtml(subtitleText),
    "{{logoUrl}}": values.logoUrl || "",
    "{{mainContent}}": safeMainContent,
  };

  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(key, value);
  }

  // Handle logo block condition
  if (!values.logoUrl) {
    result = result.replace(/{{#if logoUrl}}[\s\S]*?{{\/if}}/g, "");
  } else {
    result = result.replace("{{#if logoUrl}}", "").replace("{{/if}}", "");
  }

  return result;
}

/**
 * Wrap body HTML into a full HTML document for the iframe.
 * Here you can:
 *  - Add external CSS <link> tags (CDN / template CSS)
 *  - Add JS (template scripts, analytics, etc.)
 */
async function buildIframeDocument(): Promise<string> {
  const response = await fetch("http://localhost:5173/template1/index.html");
  const htmlText = await response.text();

  console.log(htmlText);

  return htmlText;
}

function NewProjectView() {
  const [formValues, setFormValues] = useState<SiteFormValues>({
    title: "",
    subtitle: "",
    mainContent: "",
    logoFile: null,
    logoUrl: undefined,
  });

  const handleChange =
    (field: keyof SiteFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFormValues((prev) => ({
        ...prev,
        logoFile: null,
        logoUrl: undefined,
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setFormValues((prev) => ({
      ...prev,
      logoFile: file,
      logoUrl: previewUrl,
    }));
  };

  const [iframeContent, setIFrameContent] = useState("");

  // Compute the iframe document whenever formValues change
  const iframeDoc = useMemo(async () => {
    return iframeContent;
  }, [iframeContent]);

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

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Title
          </label>
          <input
            type="text"
            value={formValues.title}
            onChange={handleChange("title")}
            style={{ width: "100%", padding: "0.5rem" }}
            placeholder="My Pizza Shop"
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Subtitle
          </label>
          <input
            type="text"
            value={formValues.subtitle}
            onChange={handleChange("subtitle")}
            style={{ width: "100%", padding: "0.5rem" }}
            placeholder="Best slices in town"
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Logo
          </label>
          <input type="file" accept="image/*" onChange={handleLogoChange} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Main Content (HTML)
          </label>
          <textarea
            value={formValues.mainContent}
            onChange={handleChange("mainContent")}
            style={{ width: "100%", height: "250px", padding: "0.5rem" }}
            placeholder={`Write HTML here...

Example:

<h2>About Us</h2>
<p>We are a family business...</p>

<h2>Services</h2>
<ul>
  <li>Delivery</li>
  <li>Catering</li>
</ul>`}
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
          // but still keeps it sandboxed away from your app.
          sandbox="allow-same-origin allow-scripts"
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "white",
          }}
          title="Site preview"
          srcDoc={iframeContent}
        />
      </div>
    </div>
  );
}

export default NewProjectView;
