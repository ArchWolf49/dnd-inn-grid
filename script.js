{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // ICONS: cycle order and logical values\
// value: 1 = arrow, 2 = skull, 3 = crown, 4 = moon/sun\
const ICONS = [\
  \{ name: "empty", value: 0, src: null \},\
  \{ name: "arrow-down", value: 1, src: "assets/icon-arrown-down.svg" \},\
  \{ name: "arrow-up", value: 1, src: "assets/icon-arrown-up.svg" \},\
  \{ name: "skull", value: 2, src: "assets/icon-skull (2).svg" \},\
  \{ name: "crown", value: 3, src: "assets/icon-crown.svg" \},\
  \{ name: "moon", value: 4, src: "assets/icon-moon.svg" \},\
  \{ name: "sun", value: 4, src: "assets/icon-sun (1).svg" \}\
];\
\
// Solution grid (logical values 1..4)\
// 2 1 3 4\
// 3 4 2 1\
// 1 2 4 3\
// 4 3 1 2\
const solutionGrid = [\
  [2,1,3,4],\
  [3,4,2,1],\
  [1,2,4,3],\
  [4,3,1,2]\
];\
\
// Initial grid values (0 = empty, >0 = logical value)\
let gridValues = [\
  [0,1,0,4], // row1: col2 arrow, col4 moon\
  [0,0,2,0], // row2: col3 skull\
  [0,0,0,3], // row3: col4 crown\
  [0,0,1,0]  // row4: col3 arrow-up (still value 1)\
];\
\
// Prefilled mask (true = locked)\
const prefilled = [\
  [false,true,false,true],\
  [false,false,true,false],\
  [false,false,false,true],\
  [false,false,true,false]\
];\
\
const gridEl = document.getElementById("grid");\
const statusEl = document.getElementById("status");\
const checkBtn = document.getElementById("checkBtn");\
const resetBtn = document.getElementById("resetBtn");\
\
// Map logical value + optional variant choice to icon index\
function getInitialIconIndex(r,c)\{\
  const v = gridValues[r][c];\
  if(v === 0) return 0;\
  // choose specific variant for prefilled cells\
  if(r === 0 && c === 1) return 1; // arrow-down\
  if(r === 3 && c === 2) return 2; // arrow-up\
  if(r === 1 && c === 2) return 3; // skull\
  if(r === 2 && c === 3) return 4; // crown\
  if(r === 0 && c === 3) return 5; // moon\
  return 0;\
\}\
\
// Track current icon index per cell\
let iconIndexGrid = [];\
\
function render()\{\
  gridEl.innerHTML = "";\
  iconIndexGrid = [];\
  for(let r=0;r<4;r++)\{\
    iconIndexGrid[r] = [];\
    for(let c=0;c<4;c++)\{\
      const cell = document.createElement("div");\
      cell.className = "cell";\
      cell.dataset.r = r;\
      cell.dataset.c = c;\
\
      if(prefilled[r][c]) cell.classList.add("prefilled");\
\
      const wrap = document.createElement("div");\
      wrap.className = "icon-wrap";\
\
      const idx = getInitialIconIndex(r,c);\
      iconIndexGrid[r][c] = idx;\
\
      if(ICONS[idx].src)\{\
        const img = document.createElement("img");\
        img.src = ICONS[idx].src;\
        img.alt = ICONS[idx].name;\
        wrap.appendChild(img);\
      \}\
\
      cell.appendChild(wrap);\
      cell.addEventListener("click", onCellClick);\
      gridEl.appendChild(cell);\
    \}\
  \}\
  statusEl.textContent = "";\
\}\
\
function onCellClick(e)\{\
  const cell = e.currentTarget;\
  const r = +cell.dataset.r;\
  const c = +cell.dataset.c;\
\
  if(prefilled[r][c]) return;\
\
  // clear feedback classes\
  cell.classList.remove("correct","wrong");\
\
  // cycle icon index\
  let idx = iconIndexGrid[r][c];\
  idx = (idx + 1) % ICONS.length;\
  iconIndexGrid[r][c] = idx;\
\
  // update logical value\
  gridValues[r][c] = ICONS[idx].value;\
\
  // update image\
  const wrap = cell.querySelector(".icon-wrap");\
  wrap.innerHTML = "";\
  if(ICONS[idx].src)\{\
    const img = document.createElement("img");\
    img.src = ICONS[idx].src;\
    img.alt = ICONS[idx].name;\
    wrap.appendChild(img);\
  \}\
\}\
\
function checkPuzzle()\{\
  // clear previous feedback\
  document.querySelectorAll(".cell").forEach(cell=>\{\
    cell.classList.remove("correct","wrong");\
  \});\
\
  let allFilled = true;\
  let rowsOk = true;\
  let colsOk = true;\
\
  // check rows\
  for(let r=0;r<4;r++)\{\
    const seen = new Set();\
    for(let c=0;c<4;c++)\{\
      const v = gridValues[r][c];\
      if(v === 0)\{\
        allFilled = false;\
        rowsOk = false;\
        markRowWrong(r);\
        break;\
      \}\
      if(seen.has(v))\{\
        rowsOk = false;\
        markRowWrong(r);\
        break;\
      \}\
      seen.add(v);\
    \}\
  \}\
\
  // check columns\
  for(let c=0;c<4;c++)\{\
    const seen = new Set();\
    for(let r=0;r<4;r++)\{\
      const v = gridValues[r][c];\
      if(v === 0)\{\
        allFilled = false;\
        colsOk = false;\
        markColWrong(c);\
        break;\
      \}\
      if(seen.has(v))\{\
        colsOk = false;\
        markColWrong(c);\
        break;\
      \}\
      seen.add(v);\
    \}\
  \}\
\
  // also check against exact solution (so arrows/moon/sun variants still fine)\
  let matchesSolution = true;\
  for(let r=0;r<4;r++)\{\
    for(let c=0;c<4;c++)\{\
      if(gridValues[r][c] !== solutionGrid[r][c])\{\
        matchesSolution = false;\
        break;\
      \}\
    \}\
    if(!matchesSolution) break;\
  \}\
\
  if(allFilled && rowsOk && colsOk && matchesSolution)\{\
    markAllCorrect();\
    statusEl.textContent = "The pattern is true \'96 the table shows only a tavern game.";\
  \}else\{\
    statusEl.textContent = "The carving is not yet right.";\
  \}\
\}\
\
function markRowWrong(r)\{\
  for(let c=0;c<4;c++)\{\
    const idx = r*4 + c;\
    gridEl.children[idx].classList.add("wrong");\
  \}\
\}\
\
function markColWrong(c)\{\
  for(let r=0;r<4;r++)\{\
    const idx = r*4 + c;\
    gridEl.children[idx].classList.add("wrong");\
  \}\
\}\
\
function markAllCorrect()\{\
  for(let i=0;i<16;i++)\{\
    gridEl.children[i].classList.add("correct");\
  \}\
\}\
\
checkBtn.addEventListener("click", checkPuzzle);\
\
resetBtn.addEventListener("click", ()=>\{\
  gridValues = [\
    [0,1,0,4],\
    [0,0,2,0],\
    [0,0,0,3],\
    [0,0,1,0]\
  ];\
  render();\
\});\
\
render();}