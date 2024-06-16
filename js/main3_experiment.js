document.addEventListener("DOMContentLoaded", () => {
  import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs")
    .then((pdfjsLib) => {
      //* Variables
      const url = "../Docs/deeplearningbook.pdf";

      let pdfDoc = null,
        pageNum = 1,
        pageIsRendering = false,
        pageNumIsPending = null;

      let scale = 3;
      let pageNumInput = 1;

      //* Rendering the Canvas ID
      const renderCanvasID = (canvas_id, num) => {
        
        console.log("Inside renderFirstPage function");
        const test_canvas = document.getElementById(canvas_id);
        console.log(test_canvas);
        const ctx = test_canvas.getContext("2d");
        console.log(ctx);
        pageIsRendering = true;

        //Get Page
        pdfDoc
          .getPage(num)
          .then((page) => {
            console.log("Page gotten");
            //Set scale
            const viewport = page.getViewport({ scale });
            test_canvas.height = viewport.height;
            test_canvas.width = viewport.width;
            console.log("Context: ", ctx);

            const renderCtx = {
              canvasContext: ctx,
              viewport,
            };

            page.render(renderCtx).promise.then(() => {
              console.log("Rendering page");
              pageIsRendering = false;
              if (pageNumIsPending != null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
              }
            });

            //Output current page
            document.querySelector("#page_num_input").textContent = num;
          })
          .catch((err) => {
            console.error("Error rendering page:", err);
          });
      };

      //* Render multiple pages
      const renderPage = (canvas, num) => {
        console.log("Inside renderPage function");
        console.log(canvas);
        const ctx = canvas.getContext("2d");
        pageIsRendering = true;

        //Get Page
        pdfDoc
          .getPage(num)
          .then((page) => {
            console.log("Page gotten");
            //Set scale
            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            console.log("Context: ", ctx);

            const renderCtx = {
              canvasContext: ctx,
              viewport,
            };

            const container = document.querySelector(".pdf_viewer");
            container.appendChild(canvas);

            page.render(renderCtx).promise.then(() => {
              console.log("Rendering page");
              pageIsRendering = false;
              if (pageNumIsPending != null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
              }
            });

            //Output current page
            document.querySelector("#page_num_input").textContent = num;
          })
          .catch((err) => {
            console.error("Error rendering page:", err);
          });
      };

      //* Rendering initial pages
      const renderInitialPages = (num) => {
        console.log("Inside renderInitialPages");
        for(let i = 1; i <= 3; i++){
          renderCanvasID(`canvas-${i}`, i);
        }
      };

      //* Check for pages rendering
      const queueRenderPage = (num) => {
        console.log("Inside queueRenderPage");
        if (pageIsRendering) {
          pageNumIsPending = num;
        } else {
          renderPage(num);
        }
      };

      //* Show specific page
      const showPage = (num) => {
        console.log("Inside Show page");
        if (num < 1 || num > pdfDoc.numPages) {
          console.log(num);
          return;
        }
        pageNum = num;
        queueRenderPage(pageNum);
      };

      //* Zoom
      const zoomIn = () => {
        scale = scale - 0.4;
        console.log(scale);
        showPage(pageNumInput);
      };

      const zoomOut = () => {
        scale = scale + 0.4;
        showPage(pageNumInput);
      };

      //* Get document
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs";
      pdfjsLib
        .getDocument(url)
        .promise.then((pdfDoc_) => {
          pdfDoc = pdfDoc_;

          document.querySelector("#page_count").textContent = pdfDoc.numPages;

          console.log("Document loaded");
          addCanvas(pdfDoc.numPages);
          renderInitialPages(pageNum);
          console.log(pdfDoc);
        })
        .catch((err) => {
          console.error("Error loading PDF document:", err);
          //Display error
          const div = document.createElement("div");
          div.className = "error";
          div.appendChild(document.createTextNode(err.message));
          document.querySelector("body").insertBefore(div, canvas);

          //Remove the top bar
          document.querySelector(".nav_bar").style.display = "none";
        });

      //* Show scroll percentage
      const show_scroll = () => {
        const scroll_percentage =
          (container.scrollTop / container.scrollHeight) * 100;
        console.log(scroll_percentage);
        //* Append a new canvas at 50% scroll (Similar to incrementing the page number)
      };

      //* add canvas
      const addCanvas = (no_of_pages) => {
        console.log("Inside addCanvas");
        const container = document.querySelector(".pdf_viewer");
        console.log(container);
        for (let i = 1; i <= no_of_pages; i++) {
          console.log("Appending blank canvas");
          const canvas = document.createElement("canvas");
          canvas.id = `canvas-${i}`;
          canvas.classList.add('canvas_experiment');
          container.appendChild(canvas);
          console.log(canvas);
        }
      };

      //* Input event
      document
        .querySelector("#page_num_input")
        .addEventListener("change", (e) => {
          pageNumInput = parseInt(e.target.value);
          if (!isNaN(pageNumInput)) {
            showPage(pageNumInput);
          }
        });

      document
        .querySelector("#page_num_input")
        .addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            pageNumInput = parseInt(e.target.value);
            if (!isNaN(pageNumInput)) {
              showPage(pageNumInput);
            }
          }
        });

      //* Zoom event
      document.querySelector("#minus").addEventListener("click", zoomIn);
      document.querySelector("#plus").addEventListener("click", zoomOut);

      //* Scroll event
      const container = document.querySelector(".pdf_viewer");

      if (container) {
        container.addEventListener("scroll", show_scroll);
      } else {
        console.error("Container not found");
      }
    })
    .catch((err) => {
      console.error("Error importing PDF.js:", err);
    });
});
