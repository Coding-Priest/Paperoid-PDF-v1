document.addEventListener('DOMContentLoaded', () => {
    import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs').then(pdfjsLib => {

        //* Variables
        const url = '../Docs/example.pdf';

        let pdfDoc = null,
            pageNum = 1,
            scale = 1.5,
            pageNumIsPending = null;

        const container = document.querySelector('.pdf_viewer');

        //* Render the page
        const renderPage = (num, scale, canvas) => {
            pdfDoc.getPage(num).then(page => {
                const viewport = page.getViewport({ scale });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const ctx = canvas.getContext('2d');
                const renderCtx = {
                    canvasContext: ctx,
                    viewport
                };

                page.render(renderCtx).promise.then(() => {
                    if (pageNumIsPending !== null) {
                        renderPage(pageNumIsPending, scale, canvas);
                        pageNumIsPending = null;
                    }
                });
            }).catch(err => {
                console.error('Error rendering page:', err);
            });
        };

        //* Lazy load pages on scroll
        const lazyLoadPages = () => {
            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;

            Array.from(container.querySelectorAll('.page')).forEach(pageDiv => {
                const pageNumber = parseInt(pageDiv.getAttribute('data-page-number'));
                const pageTop = pageDiv.offsetTop;
                const pageBottom = pageTop + pageDiv.clientHeight;

                if (pageBottom >= scrollTop && pageTop <= scrollTop + containerHeight) {
                    if (!pageDiv.querySelector('canvas')) {
                        const canvas = document.createElement('canvas');
                        pageDiv.appendChild(canvas);
                        renderPage(pageNumber, scale, canvas);
                    }
                }
            });
        };

        //* Initialize pages
        const initPages = () => {
            for (let num = 1; num <= pdfDoc.numPages; num++) {
                const pageDiv = document.createElement('div');
                pageDiv.className = 'page';
                pageDiv.setAttribute('data-page-number', num);
                pdfDoc.getPage(num).then(page => {
                    pageDiv.style.height = `${page.getViewport({ scale }).height}px`;
                    container.appendChild(pageDiv);
                });
            }
            lazyLoadPages();
        };

        //* Show specific page
        const showPage = num => {
            if (num < 1 || num > pdfDoc.numPages) {
                return;
            }
            pageNum = num;
            container.scrollTop = container.querySelector(`.page[data-page-number="${num}"]`).offsetTop;
            lazyLoadPages();
        };

        //* Zoom
        const zoomIn = () => {
            scale += 0.5;
            container.innerHTML = '';
            initPages();
        };

        const zoomOut = () => {
            scale = Math.max(0.5, scale - 0.5);
            container.innerHTML = '';
            initPages();
        };

        //* Get document
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs';
        pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
            pdfDoc = pdfDoc_;
            document.querySelector('#page_count').textContent = pdfDoc.numPages;
            initPages();
        }).catch(err => {
            console.error('Error loading PDF document:', err);
            const div = document.createElement('div');
            div.className = 'error';
            div.appendChild(document.createTextNode(err.message));
            document.querySelector('body').insertBefore(div, container);
            document.querySelector('.nav_bar').style.display = 'none';
        });

        //* Input event
        document.querySelector('#page_num_input').addEventListener('change', (e) => {
            const pageNumInput = parseInt(e.target.value);
            if (!isNaN(pageNumInput)) {
                showPage(pageNumInput);
            }
        });

        //* Zoom event
        document.querySelector('#minus').addEventListener('click', zoomOut);
        document.querySelector('#plus').addEventListener('click', zoomIn);

        //* Scroll event
        container.addEventListener('scroll', lazyLoadPages);
    }).catch(err => {
        console.error('Error importing PDF.js:', err);
    });
});
