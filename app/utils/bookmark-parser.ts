export interface ChromeBookmark {
  id: string;
  title: string;
  url?: string;
  children?: ChromeBookmark[];
}

export class BookmarkParser {
  static parseBookmarkFile(
    html: string,
    type: "chrome" | "firefox" | "safari" | "ie" = "chrome"
  ): ChromeBookmark[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    console.log("Parsing HTML document for browser:", type);

    // 不同浏览器的解析策略
    switch (type) {
      case "chrome":
        return this.parseChromeBookmarks(doc);
      case "firefox":
        return this.parseFirefoxBookmarks(doc);
      case "safari":
        return this.parseSafariBookmarks(doc);
      case "ie":
        return this.parseIEBookmarks(doc);
      default:
        return this.parseChromeBookmarks(doc);
    }
  }

  // Chrome 书签解析
  private static parseChromeBookmarks(doc: Document): ChromeBookmark[] {
    const bookmarks: ChromeBookmark[] = [];

    // Chrome 书签通常在 DL > DT > A 或 DL > DT > H3 + DL 结构中
    const processNode = (node: Element): ChromeBookmark[] => {
      const items: ChromeBookmark[] = [];

      // 直接处理所有的 DT 元素
      const dts = node.querySelectorAll(":scope > dt");
      console.log(`Found ${dts.length} DT elements`);

      dts.forEach((dt) => {
        // 书签链接
        const a = dt.querySelector(":scope > a");
        if (a) {
          const bookmark = {
            id: a.getAttribute("href") || "",
            title: a.textContent?.trim() || "",
            url: a.getAttribute("href") || "",
          };
          console.log("Found bookmark:", bookmark.title);
          items.push(bookmark);
          return;
        }

        // 文件夹
        const h3 = dt.querySelector(":scope > h3");
        const dl = dt.querySelector(":scope > dl");
        if (h3 && dl) {
          const folder = {
            id: h3.textContent?.trim() || "",
            title: h3.textContent?.trim() || "",
            children: processNode(dl),
          };
          console.log(
            "Found folder:",
            folder.title,
            "with",
            folder.children.length,
            "items"
          );
          items.push(folder);
        }
      });

      return items;
    };

    // 查找根 DL 元素
    const rootDL = doc.querySelector("dl");
    if (!rootDL) {
      console.warn("No root DL element found");
      return [];
    }

    const result = processNode(rootDL);
    console.log("Total parsed items:", result.length);
    return result;
  }

  // Firefox 书签解析
  private static parseFirefoxBookmarks(doc: Document): ChromeBookmark[] {
    // Firefox 的结构类似，但可能有一些特殊属性
    return this.parseChromeBookmarks(doc);
  }

  private static parseSafariBookmarks(doc: Document): ChromeBookmark[] {
    // Safari 的书签结构可能不同
    return this.parseChromeBookmarks(doc);
  }

  private static parseIEBookmarks(doc: Document): ChromeBookmark[] {
    // IE 的书签结构可能不同
    return this.parseChromeBookmarks(doc);
  }
}
