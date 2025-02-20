import { PAGE_SIZES } from '../constants';

export function renderPageCount(book) {
    const pageCount = document.getElementById('page_count');
    pageCount.innerText = book.pagecount;
}

export function renderInfoBox(book) {
    const totalSheets = document.getElementById('total_sheets');
    const sigCount = document.getElementById('sig_count');
    const sigArrange = document.getElementById('sig_arrange');
    const totalPages = document.getElementById('total_pages');

    if (book.book == null || book.book == undefined)
        return

    const outputPages = book.book.pagelist.reduce((acc, list) => {
        list.forEach((sublist) => (acc += sublist.length));
        return acc;
    }, 0);

    totalSheets.innerText = book.book.sheets;
    sigCount.innerText = book.book.sigconfig.length;
    sigArrange.innerText = book.book.sigconfig.join(', ');
    totalPages.innerText = outputPages;
}

/**
 * Expects a data object describing the overall page layout info:
 *
 */
export function updatePageLayoutInfo(info) {
  document.getElementById("show_layout_info").style.display = 'block'
  console.log("So much info from updatePageLayoutInfo: ", info)
  let needsRotation = info.dimensions.layout.rotations[0] == -90 || info.dimensions.layout.rotations[0] == 90 ||  info.dimensions.layout.rotations[0][0] == -90 ||  info.dimensions.layout.rotations[0][0] == 90  
  //   Paper size: ${info.papersize[0]}, ${info.papersize[1]}<BR>
  let paperDims = info.dimensions.layoutCell
  let pdfDims = [info.dimensions.xPdfWidthFunc(), info.dimensions.yPdfHeightFunc()]

  let scale = Math.min(Math.min(250/paperDims[0], 250/paperDims[1]), Math.min(250/pdfDims[0], 250/pdfDims[1]))
  
  let dims = [paperDims[0] * scale, paperDims[1] * scale]
  let displayDiv = document.getElementById("grid_layout_preview") // blue box
  displayDiv.style.width = `${dims[0]}px`
  displayDiv.style.height = `${dims[1]}px`

  dims = [pdfDims[0] * scale, pdfDims[1] * scale]
  displayDiv = document.getElementById("pdf_on_page_layout_preview")  // orange box
  displayDiv.style.width = `${dims[0]}px`
  displayDiv.style.height = `${dims[1]}px`

  dims = [info.dimensions.xBindingShiftFunc() * scale, info.dimensions.yTopShiftFunc() * scale]
  displayDiv.style.margin = `${dims[1]}px ${dims[0]}px`

  document.getElementById("page_grid_layout").innerText = `${info.dimensions.layout.rows} rows x ${info.dimensions.layout.cols} cols`
  document.getElementById("page_grid_dimensions").innerText = `${paperDims[0]}, ${paperDims[1]}`
  document.getElementById("pdf_source_dimensions").innerText = `${info.cropbox.width}, ${info.cropbox.height}`
  document.getElementById("pdf_page_dimensions").innerText = `${pdfDims[0].toFixed(2)}, ${pdfDims[1].toFixed(2)}`
  document.getElementById("pdf_offset_dimensions").innerHTML = `
  ${info.dimensions.xBindingShiftFunc().toFixed(2)} from spine <BR>
  ${info.dimensions.yTopShiftFunc().toFixed(2)} from top <BR>
  ${info.dimensions.xForeEdgeShiftFunc().toFixed(2)} from fore edge <BR>
  ${info.dimensions.yBottomShiftFunc().toFixed(2)} from bottom
  `
  document.getElementById("pdf_scale_dimensions").innerText = `${info.dimensions.pdfScale[0].toFixed(2)}, ${info.dimensions.pdfScale[1].toFixed(2)}`
  document.getElementById("pdf_page_rotation_info").innerText = `${needsRotation}`
}
/**
 * Expects a data object describing the overall page layout info:
 *
 */
export function updatePaperSelectOptionsUnits() {
    const paperList = document.getElementById('paper_size');
    const paperListUnit = document.getElementById('paper_size_unit').value
    for(let option of Array.from(paperList.children)) {
        let paperName = option.value
        let paper = PAGE_SIZES[paperName]
        let label = `${paperName} (${paper[0]} x ${paper[1]} pt)`
        // conversion values from Google default converter
        if (paperListUnit == 'in') {
            label = `${paperName} (${(paper[0] * 0.0138889).toFixed(1)} x ${(paper[1] * 0.0138889).toFixed(1)} inches)`
        } else if (paperListUnit == 'cm') {
            label= `${paperName} (${(paper[0] * 0.0352778).toFixed(2)} x ${(paper[1] * 0.0352778).toFixed(2)} cm)`
        }
        option.setAttribute('label', label);
    }
}
export function updateAddOrRemoveCustomPaperOption() {
    const width = document.getElementById('paper_size_custom_width').value;
    const height = document.getElementById('paper_size_custom_height').value;
    const paperList = document.getElementById('paper_size');
    const validDimensions = width.length > 0 && height.length > 0 && !isNaN(width) && !isNaN(height)
    const customOpt = paperList.children.namedItem("CUSTOM")
    if (customOpt == null && !validDimensions) {
        // No custom option, no valid custom settings
    } else if (customOpt != null && !validDimensions) {
        // Need to remove custom option because no valid custom settings
        customOpt.remove()
    } else if (customOpt == null) {
        // no option but valid settings!
        let opt = document.createElement('option');
        opt.setAttribute('value', 'CUSTOM');
        opt.setAttribute('name', 'CUSTOM');
        PAGE_SIZES['CUSTOM'] = [Number(width), Number(height)]
        paperList.appendChild(opt);
    } else {
        // valid option, valid dimensions -- lets just make sure they're up to date
        PAGE_SIZES['CUSTOM'] = [Number(width), Number(height)]
    }


}
export function renderPaperSelectOptions() {
    const paperList = document.getElementById('paper_size');
    let maxLength = Math.max(Object.keys(PAGE_SIZES).map( (s) => { s.length}))
    Object.keys(PAGE_SIZES).forEach((key) => {
        let opt = document.createElement('option');
        opt.setAttribute('value', key);
        opt.setAttribute('name', key);
        if (key == 'A4') {
            opt.setAttribute('selected', true);
        }
        opt.innerText = key;
        paperList.appendChild(opt);
    });
    updatePaperSelectOptionsUnits()
}

export function renderWacky() {
    const isWacky =
        document.getElementById('a9_3_3_4').checked ||
        document.getElementById('a10_6_10s').checked ||
        document.getElementById('a_3_6s').checked ||
        document.getElementById('a_4_8s').checked ||
        document.getElementById('A7_2_16s').checked ||
        document.getElementById('1_3rd').checked;
    console.log('Is a wacky layout? ', isWacky);
    document
        .getElementById('book_size')
        .querySelectorAll('input')
        .forEach((x) => {
            x.disabled = isWacky;
        });
    document.getElementById('book_size').style.opacity = isWacky ? 0.3 : 1.0;
}

export function renderFormFromSettings(bookSettings) {
    if (bookSettings.duplex) {
        document
            .querySelector('#printer_type > option[value="duplex"]')
            .setAttribute('selected', '');
        document
            .querySelector('#printer_type > option[value="single"]')
            .removeAttribute('selected');
    } else {
        document
            .querySelector('#printer_type > option[value="single"]')
            .setAttribute('selected', '');
        document
            .querySelector('#printer_type > option[value="duplex"]')
            .removeAttribute('selected');
    }

    // if (bookSettings.lockratio) {
    //     document
    //         .querySelector('option[value="lockratio"]')
    //         .setAttribute('selected', '');
    //     document
    //         .querySelector('option[value="stretch"]')
    //         .removeAttribute('selected');
    // } else {
    //     document
    //         .querySelector('option[value="stretch"]')
    //         .setAttribute('selected', '');
    //     document
    //         .querySelector('option[value="lockratio"]')
    //         .removeAttribute('selected');
    // }

    if (bookSettings.duplexrotate) {
        document
            .querySelector('input[name="rotate_page"')
            .setAttribute('checked', '');
    } else {
        document
            .querySelector('input[name="rotate_page"')
            .removeAttribute('checked');
    }

    document.querySelector('option[value="A4"]').removeAttribute('selected');
    document
        .querySelector('option[value="' + bookSettings.papersize + '"]')
        .setAttribute('selected', '');

    document.getElementById(bookSettings.format).setAttribute('checked', '');
    document
        .getElementById(bookSettings.pagelayout)
        .setAttribute('checked', '');
    document
        .querySelector('input[name="sig_length')
        .setAttribute('value', bookSettings.sigsize);
}
