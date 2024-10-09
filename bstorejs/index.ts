import { file, serve } from "bun";
import { put, get, del } from 'bstorejs';

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === "/") {
      return new Response(file("index.html"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/upload" && req.method === "POST") {
      const formData = await req.formData();
      const file = formData.get("file");
      
      if (file instanceof File) {
        try {
          const res = await put(file.name, 'public', file);
          return new Response(JSON.stringify(res), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: "Upload failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/get" && req.method === "GET") {
      const fileName = url.searchParams.get("fileName");

      if (fileName) {
        try {
          const res = await get(fileName, 'public');
          return new Response(JSON.stringify(res), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: "Get failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
      return new Response(JSON.stringify({ error: "No fileName provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/delete" && req.method === "DELETE") {
      const fileName = url.searchParams.get("fileName");
      
      if (fileName) {
        try {
          const res = await del(fileName, 'public');
          return new Response(JSON.stringify(res), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: "Delete failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
      return new Response(JSON.stringify({ error: "No fileName provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/favicon.ico") {
      return new Response(file("favicon.ico"), {
        headers: { "Content-Type": "image/x-icon" },
      });
    }

    return new Response("404 Not Found", { status: 404 });
  },
});

if (!process.env.BSTORE_READ_WRITE_KEY) {
  console.error("Please set BSTORE_READ_WRITE_KEY environment variable");
  process.exit(1);
}
console.log("Server running at http://localhost:3000");