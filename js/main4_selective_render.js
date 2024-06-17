document.addEventListener("DOMContentLoaded", () => {
  import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs")
    .then((pdfjsLib) => {
      //* Declaring Variables
      const url = "../Docs/deeplearningbook.pdf";

      let pdfDoc = null,
        pageNum = 1,
        pageIsRendering = false,
        pageNumIsPending = null;

      let scale = 1.5;
      let pageNumInput = 1;

      //* Rendering the Canvas ID
      const renderCanvasID = (canvas_id, num) => {
        //   console.log("Inside renderCanvasID function");
        const test_canvas = document.getElementById(canvas_id);
        //   console.log(test_canvas);
        const ctx = test_canvas.getContext("2d");
        //   console.log(num);
        pageIsRendering = true;

        // Get Page
        pdfDoc
          .getPage(num)
          .then((page) => {
            //   console.log("Page gotten");
            // Set scale
            const viewport = page.getViewport({ scale });
            test_canvas.height = viewport.height;
            test_canvas.width = viewport.width;
            //   console.log("Context: ", ctx);

            const renderCtx = {
              canvasContext: ctx,
              viewport,
            };

            page.render(renderCtx).promise.then(() => {
              // console.log("Rendering context");
              pageIsRendering = false;
              if (pageNumIsPending != null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
              }
            });

            // Output current page
            document.querySelector("#page_num_input").textContent = num;
          })
          .catch((err) => {
            console.error("Error rendering page:", err);
          });
      };

      //* Rendering initial pages
      const renderInitialPages = () => {
        //   console.log("Inside renderInitialPages");
        for (let i = 1; i <= 3; i++) {
          renderCanvasID(`canvas-${i}`, i);
        }
      };

      //* Check for pages rendering
      const queueRenderPage = (num) => {
        //   console.log("Inside queueRenderPage");
        if (pageIsRendering) {
          pageNumIsPending = num;
        } else {
          renderPage(num);
        }
      };

      //* Show specific page
      const showPage = (num) => {
        //   console.log("Inside Show page");
        if (num < 1 || num > pdfDoc.numPages) {
          // console.log(num);
          return;
        }
        pageNum = num;
        queueRenderPage(pageNum);
      };

      const resizeAndRenderPages = (scrollTop, scrollLeft, newScale) => {
        pdfDoc.getPage(1).then((page) => {
          // console.log("Reading Dimensions");
          const viewport = page.getViewport({ scale: newScale });
          const new_height = Math.round(viewport.height);
          const new_width = Math.round(viewport.width);

          console.log("New width: ", new_width, "New height: ", new_height);

          const canvas_boxes = document.querySelectorAll(".canvas_experiment");
          canvas_boxes.forEach((canvas_box) => {
            canvas_box.height = new_height;
            canvas_box.width = new_width;
          });

          // console.log("Blank canvases are resized");
          renderInitialPages();

          // Restore scroll position
          const scaleRatio = newScale / scale;
          container.scrollTop = scrollTop * scaleRatio;
          container.scrollLeft = scrollLeft * scaleRatio;

          // Update scale
          scale = newScale;
        });
      };

      //* Zoom
      const zoomIn = () => {
        //   console.log("Zooming in");
        const scrollTop = container.scrollTop;
        const scrollLeft = container.scrollLeft;
        const newScale = scale + 0.2;

        //   console.log("Current scale: ", scale);
        //   console.log("Current scrollTop: ", scrollTop);
        //   console.log("Current scrollLeft: ", scrollLeft);
        //   console.log("New scale: ", newScale);

        resizeAndRenderPages(scrollTop, scrollLeft, newScale);
      };

      const zoomOut = () => {
        //   console.log("Zooming out");
        const scrollTop = container.scrollTop;
        const scrollLeft = container.scrollLeft;
        const newScale = scale - 0.2;
        //   console.log("Current scale: ", scale);
        //   console.log("Current scrollTop: ", scrollTop);
        //   console.log("Current scrollLeft: ", scrollLeft);
        //   console.log("New scale: ", newScale);

        resizeAndRenderPages(scrollTop, scrollLeft, newScale);
      };

      //* Get document
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs";
      pdfjsLib
        .getDocument(url)
        .promise.then((pdfDoc_) => {
          pdfDoc = pdfDoc_;

          document.querySelector("#page_count").textContent = pdfDoc.numPages;

          // console.log("Document loaded");
          addCanvas(pdfDoc.numPages);
          renderInitialPages(pageNum);
          // console.log(pdfDoc);
        })
        .catch((err) => {
          console.error("Error loading PDF document:", err);
          // Display error
          const div = document.createElement("div");
          div.className = "error";
          div.appendChild(document.createTextNode(err.message));
          document.querySelector("body").insertBefore(div, canvas);

          // Remove the top bar
          document.querySelector(".nav_bar").style.display = "none";
        });

      //* Show scroll percentage
      const show_scroll = () => {
        console.log("Scroll Top: ", container.scrollTop);
        console.log("Scroll Height: ", container.scrollHeight);
        const canvas_box = document.querySelector('.canvas_experiment');
        const position = container.scrollTop / canvas_box.height;
        var page_no = Math.floor(position);
        var decimal = position - Math.floor(position);
        if(decimal > 0.8){
            page_no++;
        }
        document.querySelector("#page_num_input").value = page_no+1;
      };

      //* add canvas
      const addCanvas = (no_of_pages) => {
        //   console.log("Inside addCanvas");
        const container = document.querySelector(".pdf_viewer");
        //   console.log(container);
        for (let i = 1; i <= no_of_pages; i++) {
          const canvas = document.createElement("canvas");
          canvas.id = `canvas-${i}`;
          canvas.classList.add("canvas_experiment");
          container.appendChild(canvas);
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
      document.querySelector("#minus").addEventListener("click", zoomOut);
      document.querySelector("#plus").addEventListener("click", zoomIn);

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
