import { describe, expect, it } from "vitest";
import { blankSvg, prepareSvg, SAMPLE_SVG } from "../editor/documents";

const parse = (source: string) =>
  new DOMParser().parseFromString(prepareSvg(source), "image/svg+xml");
describe("SVG 导入边界", () => {
  it("保留可编辑图形、图层名称、锁定信息与原始尺寸", () => {
    const svg = parse(SAMPLE_SVG);
    expect(svg.querySelectorAll("rect,circle,path,text")).toHaveLength(6);
    expect(svg.querySelector("g")?.classList.contains("layer")).toBe(true);
    expect(svg.querySelector("#paper")?.getAttribute("data-locked")).toBe(
      "true",
    );
    expect(svg.documentElement.getAttribute("width")).toBe("800");
  });
  it("拒绝非 SVG、破损 XML 和无效尺寸", () => {
    for (const source of [
      "<html/>",
      "<svg><path></svg>",
      '<svg width="-2" height="100"/>',
      '<svg width="50000" height="100"/>',
    ])
      expect(() => prepareSvg(source)).toThrow();
  });
  it("从 viewBox 补齐尺寸且保留非零原点", () => {
    const svg = parse(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 20 640 480"><rect width="10" height="10"/></svg>',
    );
    expect(svg.documentElement.getAttribute("width")).toBe("640");
    expect(svg.documentElement.getAttribute("height")).toBe("480");
    expect(svg.documentElement.getAttribute("viewBox")).toBe("10 20 640 480");
  });
  it("移除脚本、事件、HTML、动画与外部资源", () => {
    const svg = parse(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><foreignObject><iframe src="https://example.org"/></foreignObject><style>@import url(https://example.org/a.css)</style><rect onclick="alert(1)" fill="url(https://example.org/a.svg#p)" style="stroke: url(https://example.org/a.svg#p)"/><image href="https://example.org/private.png"/><animate attributeName="href" values="javascript:alert(1)"/></svg>',
    );
    expect(
      svg.querySelector("script,foreignObject,iframe,style,animate"),
    ).toBeNull();
    expect(svg.querySelector("rect")?.hasAttribute("onclick")).toBe(false);
    expect(svg.querySelector("rect")?.hasAttribute("fill")).toBe(false);
    expect(svg.querySelector("image")?.hasAttribute("href")).toBe(false);
    expect(new XMLSerializer().serializeToString(svg)).not.toContain(
      "https://example.org",
    );
  });
  it("保留本地渐变和裁剪引用", () => {
    const svg = parse(
      '<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop offset="0" stop-color="red"/></linearGradient><clipPath id="c"><rect width="10" height="10"/></clipPath></defs><rect fill="url(#g)" clip-path="url(\'\'#c\'\')"/></svg>'.replace(
        "url(''#c'')",
        "url('#c')",
      ),
    );
    expect(svg.querySelector("svg > rect")?.getAttribute("fill")).toBe(
      "url(#g)",
    );
    expect(svg.querySelector("svg > rect")?.getAttribute("clip-path")).toBe(
      "url('#c')",
    );
  });
  it("新建画布无额外背景对象，可导出透明内容", () => {
    const svg = parse(blankSvg(1200, 900));
    expect(svg.documentElement.getAttribute("width")).toBe("1200");
    expect(svg.querySelector("rect")).toBeNull();
  });
  it("将内联外观转换为可编辑属性，避免 CSS 覆盖属性面板的修改", () => {
    const svg = parse(
      '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red" style="fill: #38bdf8; stroke-width: 4; opacity: 0.5" width="10" height="10"/></svg>',
    );
    const rect = svg.querySelector("rect")!;
    expect(rect.getAttribute("fill")).toBe("#38bdf8");
    expect(rect.getAttribute("stroke-width")).toBe("4");
    expect(rect.getAttribute("opacity")).toBe("0.5");
    expect(rect.hasAttribute("style")).toBe(false);
  });
});
