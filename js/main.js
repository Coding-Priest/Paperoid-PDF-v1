document.addEventListener('DOMContentLoaded', () => {
    import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs').then(pdfjsLib => {

        //* Variables
        const url = '../Docs/example.pdf';

        let pdfDoc = null,
            pageNum = 1,
            pageIsRendering = false,
            pageNumIsPending = null

        const
            canvas = document.querySelector('#pdf-render'),
            ctx = canvas.getContext('2d');

        let scale = 3;
        let pageNumInput = 1;

        if (!ctx) {
            console.error('Failed to get canvas context');
            return;
        }

        //* Render the page
        const renderPage = num => {
            console.log("Inside renderPage");
            console.log(scale);
            pageIsRendering = true;
            
            //Get Page
            pdfDoc.getPage(num).then(page => {
                //Set scale
                const viewport = page.getViewport({scale});
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderCtx = {
                    canvasContext: ctx,
                    viewport
                }

                page.render(renderCtx).promise.then(() => {
                    pageIsRendering = false;
                    if(pageNumIsPending != null){
                        renderPage(pageNumIsPending);
                        pageNumIsPending = null;
                    }

                });

                //Output current page
                document.querySelector('#page_num_input').textContent = num;
            }).catch(err => {
                console.error('Error rendering page:', err);
            });
        }

        //* Check for pages rendering
        const queueRenderPage = num => {
            console.log("Inside queueRenderPage")
            if(pageIsRendering){
                pageNumIsPending = num;
            }
            else{
                renderPage(num);
            }
        }

        //* Show specific page
        const showPage = num => {
            console.log("Inside Show page");
            if(num < 1 || num > pdfDoc.numPages){
                console.log(num);
                return;
            }
            pageNum = num;
            queueRenderPage(pageNum);
        }

        //* Zoom
        const zoomIn = () => {
            scale = scale - 0.4;
            console.log(scale);
            showPage(pageNumInput);
        }

        const zoomOut = () => {
            scale = scale + 0.4;
            showPage(pageNumInput);
        }

        //* Get document
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs';
        pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
            pdfDoc = pdfDoc_;

            document.querySelector('#page_count').textContent = pdfDoc.numPages;

            renderPage(pageNum);
            console.log(pdfDoc);
        })
        .catch(err => {
            console.error('Error loading PDF document:', err);
            //Display error
            const div = document.createElement('div');
            div.className = 'error';
            div.appendChild(document.createTextNode(err.message));
            document.querySelector('body').insertBefore(div, canvas);

            //Remove the top bar
            document.querySelector('.nav_bar').style.display = 'none';
        })

        //* record scroll percentage
        const show_scroll = () => {
            const scroll_percentage = (container.scrollTop / container.scrollHeight)*100;
            console.log(scroll_percentage);
            
            //* Append a new canvas at 50% scroll (Similar to incrementing the page number)

        }

        //* Input event
        document.querySelector('#page_num_input').addEventListener('change', (e) => {
            pageNumInput = parseInt(e.target.value);
            if(!isNaN(pageNumInput)){
                showPage(pageNumInput);
            }
        });

        document.querySelector('#page_num_input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                pageNumInput = parseInt(e.target.value);
                if(!isNaN(pageNumInput)){
                    showPage(pageNumInput);
                }
            }
        });

        //* Zoom event
        document.querySelector('#minus').addEventListener('click', zoomIn);
        document.querySelector('#plus').addEventListener('click', zoomOut);

        //* Scroll event
        const container = document.querySelector('.pdf_viewer');

        if (container) {
            console.log("here");
            container.addEventListener('scroll', show_scroll);
        } else {
            console.error("Container not found");
        }

    }).catch(err => {
        console.error('Error importing PDF.js:', err);
    });
});