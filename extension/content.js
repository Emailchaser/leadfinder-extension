const buttonID = "3289c8e5-aa07-404d-8277-3ad3e32e5bc9";

// URL for the lead finder page
const url = "https://app.emailchaser.com/lead-finder/linkedin-sales-navigator";

// Cache for mode/job so we don't lose them after cleaning the hash
let cachedModeJob = null;

// Read ec_mode / ec_job from the URL fragment (hash) exactly once.
function getModeAndJobFromHashOnce() {
  if (cachedModeJob) {
    return cachedModeJob;
  }

  const hash = window.location.hash;
  if (!hash || hash.length <= 1) {
    cachedModeJob = { mode: "extract", jobId: null };
  } else {
    const fragment = hash.slice(1); // remove leading "#"
    const params = new URLSearchParams(fragment);

    const mode = params.get("ec_mode") || "extract";
    const jobId = params.get("ec_job") || null;

    cachedModeJob = { mode, jobId };
  }

  // Clean URL only once, after we've cached the values
  if (window.location.hash && window.location.hash.includes("ec_")) {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }

  return cachedModeJob;
}

function parseCount(value) {
  // Remove commas and trim whitespace
  value = value.replace(/,/g, '').trim();

  // Extract number and suffix using regex, ignoring any following text
  const match = value.match(/([\d.]+)\s*([KM])?/i);
  if (!match) return 0;

  const number = parseFloat(match[1]);
  const suffix = match[2]?.toUpperCase();

  // Convert based on suffix
  if (suffix === 'K') {
    return Math.floor(incrementValue(number, 'K') * 1000);
  }
  if (suffix === 'M') {
    return Math.floor(incrementValue(number, 'M') * 1000000);
  }

  return Math.floor(number);
}

function incrementValue(number, suffix) {
  // Special case for numbers less than 10K
  // 1K -> 1.5K, 2K -> 2.5K, ..., 9K -> 9.5K
  if (suffix === 'K' && number < 10 && Number.isInteger(number)) {
    return number + 0.5;
  }

  if (Number.isInteger(number)) {
    return number + 1;
  }

  const numStr = number.toString();
  const decimalPlaces = (numStr.split('.')[1] || '').length;
  const multiplier = Math.pow(10, decimalPlaces);
  return (Math.round(number * multiplier) + 1) / multiplier;
}

function getCount() {
  // First try to get count from Total results span
  const totalResultsSpan = document.querySelector('span[title="Total results"]');
  if (totalResultsSpan && totalResultsSpan.previousElementSibling) {
    const text = totalResultsSpan.previousElementSibling.textContent.trim();
    return parseCount(text);
  }

  // If not found, try with spans after this button
  const button = document.querySelector('button[aria-label="Unsave all selected leads."]');
  if (button) {
    // Search in all siblings
    const siblings = Array.from(button.parentElement.children);
    for (let sb of siblings) {
      // Search in all spans
      const spans = sb.querySelectorAll('span');
      for (const span of spans) {
        const text = span.textContent.trim();
        const count = parseCount(text);
        if (count > 0) {
          return count;
        }
      }
    }
  }

  return 0;
}

/**
 * Create the main button.
 * `mode` can be "extract" (default) or "resume".
 * `jobId` is only set in resume mode, coming from #ec_job=<jobId>.
 */
function createButton(tabID, extensionID, mode = "extract", jobId = null) {
  const button = document.createElement('button');
  button.id = buttonID;
  button.className = 'export-button';

  button.dataset.mode = mode;
  if (jobId) {
    button.dataset.jobId = jobId;
  }

  const label =
    mode === "resume" && jobId
      ? "Resume extraction in Emailchaser"
      : "Export with Emailchaser";

  button.innerHTML = `
    <svg class="export-button-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_11866_16995" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="2" y="2" width="16" height="16">
    <path d="M17.0392 2.02148H2.96484V17.9828H17.0392V2.02148Z" fill="white"/>
    </mask>
    <g mask="url(#mask0_11866_16995)">
    <path d="M16.3285 10.7057L16.3217 10.6806C16.3086 10.6305 16.2858 10.5833 16.2544 10.542C16.2231 10.5007 16.184 10.4659 16.1392 10.4397C16.0944 10.4135 16.045 10.3963 15.9936 10.3893C15.9422 10.3822 15.8899 10.3853 15.8398 10.3984L13.023 11.1407C12.9223 11.167 12.8153 11.1525 12.7252 11.1006L11.4305 10.3515V10.3483C11.3703 10.3136 11.3202 10.2636 11.2855 10.2034C11.2507 10.1432 11.2324 10.0749 11.2324 10.0054C11.2324 9.93582 11.2507 9.86751 11.2855 9.8073C11.3202 9.74709 11.3703 9.6971 11.4305 9.66236L12.7638 8.89135C12.8539 8.83916 12.9609 8.82472 13.0616 8.85118L15.8392 9.5815C15.8894 9.5947 15.9417 9.59787 15.9931 9.59082C16.0445 9.58377 16.094 9.56665 16.1388 9.54043C16.1836 9.51421 16.2227 9.47942 16.254 9.43804C16.2853 9.39666 16.3082 9.3495 16.3212 9.29928L16.328 9.27424C16.3547 9.17276 16.34 9.06484 16.2872 8.97416C16.2344 8.88349 16.1478 8.81748 16.0463 8.79066L14.8377 8.47245C14.7624 8.45185 14.6949 8.40943 14.6436 8.35052C14.5923 8.29162 14.5596 8.21887 14.5495 8.14142C14.5395 8.06397 14.5526 7.98528 14.5872 7.91526C14.6217 7.84523 14.6762 7.78699 14.7438 7.74786L16.7855 6.56734C16.8304 6.54136 16.8699 6.50677 16.9015 6.46554C16.9331 6.42431 16.9563 6.37726 16.9697 6.32707C16.9831 6.27688 16.9865 6.22454 16.9797 6.17303C16.9729 6.12153 16.956 6.07187 16.9299 6.0269L16.9174 6.00395C16.865 5.91315 16.7787 5.84686 16.6775 5.81966C16.5763 5.79247 16.4684 5.80659 16.3775 5.85893L14.3098 7.0551C14.242 7.09414 14.164 7.11213 14.0859 7.10681C14.0077 7.10148 13.933 7.07307 13.871 7.02519C13.809 6.9773 13.7627 6.91209 13.7378 6.83782C13.713 6.76356 13.7107 6.68358 13.7314 6.60803L14.0715 5.3597C14.099 5.2585 14.0853 5.15052 14.0334 5.0594C13.9815 4.96828 13.8956 4.90144 13.7945 4.87351L13.7689 4.86673C13.6678 4.83925 13.5599 4.85305 13.4689 4.90509C13.378 4.95713 13.3114 5.04315 13.2838 5.14426L12.5165 7.96123C12.4891 8.06176 12.4231 8.14742 12.3329 8.19962L11.0096 8.96334V8.9602C10.9495 8.99496 10.8813 9.01326 10.8119 9.01326C10.7424 9.01326 10.6743 8.99496 10.6142 8.96021C10.5541 8.92545 10.5042 8.87547 10.4696 8.8153C10.435 8.75513 10.4168 8.68689 10.417 8.61747V7.04362C10.417 6.93926 10.4582 6.83913 10.5317 6.76505L12.552 4.72171C12.6262 4.64746 12.6678 4.5468 12.6678 4.44183C12.6678 4.33687 12.6262 4.23621 12.552 4.16196L12.5332 4.14319C12.4587 4.06953 12.3581 4.02844 12.2533 4.02893C12.1486 4.02941 12.0483 4.07145 11.9746 4.1458L11.0951 5.03262C11.0401 5.08921 10.9695 5.12804 10.8923 5.1441C10.815 5.16017 10.7348 5.15274 10.6618 5.12276C10.5888 5.09279 10.5265 5.04165 10.4829 4.97593C10.4393 4.91022 10.4163 4.83294 10.417 4.75405V2.39249C10.417 2.28771 10.3754 2.18722 10.3014 2.11307C10.2273 2.03893 10.1269 1.99721 10.0221 1.99707H9.99605C9.89127 1.99721 9.79084 2.03893 9.7168 2.11307C9.64276 2.18722 9.60118 2.28771 9.60118 2.39249V4.78431C9.6016 4.86308 9.5785 4.94018 9.53482 5.00573C9.49114 5.07128 9.42888 5.12229 9.35603 5.15222C9.28317 5.18215 9.20304 5.18963 9.1259 5.17371C9.04876 5.1578 8.97813 5.1192 8.92307 5.06287L8.01493 4.1458C7.94115 4.07145 7.84088 4.02941 7.73614 4.02893C7.6314 4.02844 7.53075 4.06953 7.45628 4.14319L7.4375 4.16196C7.36309 4.23593 7.32104 4.33638 7.32055 4.4413C7.32006 4.54622 7.36118 4.64705 7.43489 4.72171L9.48538 6.79531C9.55896 6.86912 9.60023 6.96913 9.60014 7.07336V8.60339C9.60019 8.67282 9.58195 8.74105 9.54727 8.8012C9.51259 8.86135 9.46268 8.91131 9.40257 8.94605C9.34245 8.98079 9.27425 8.99909 9.20482 8.9991C9.13539 8.99911 9.06718 8.98084 9.00705 8.94612L7.64406 8.15737C7.55372 8.10534 7.48769 8.01961 7.46045 7.91897L6.7041 5.14426C6.67652 5.04315 6.60993 4.95713 6.51897 4.90509C6.42801 4.85305 6.32012 4.83925 6.21899 4.86673L6.19343 4.87351C6.09235 4.90144 6.00645 4.96828 5.95454 5.0594C5.90263 5.15052 5.88893 5.2585 5.91645 5.3597L6.24559 6.56734C6.26624 6.64289 6.264 6.72286 6.23914 6.79713C6.21428 6.8714 6.16793 6.93661 6.10597 6.9845C6.044 7.03239 5.96921 7.06079 5.89108 7.06612C5.81296 7.07144 5.735 7.05345 5.66712 7.01441L3.62445 5.83337C3.57949 5.80738 3.52986 5.79052 3.47838 5.78375C3.42689 5.77698 3.37458 5.78042 3.32444 5.79389C3.27429 5.80736 3.22729 5.8306 3.18613 5.86225C3.14497 5.89391 3.11046 5.93338 3.08457 5.97839L3.07153 6.00082C3.01913 6.09167 3.00492 6.1996 3.03201 6.30093C3.05909 6.40225 3.12528 6.48869 3.21602 6.54126L5.28373 7.73691C5.35162 7.77615 5.40633 7.83466 5.44092 7.90504C5.47552 7.97541 5.48844 8.05447 5.47804 8.1322C5.46765 8.20993 5.43441 8.28282 5.38255 8.34163C5.33068 8.40044 5.26252 8.44252 5.1867 8.46254L3.93742 8.79171C3.83598 8.81853 3.74933 8.88453 3.69652 8.9752C3.6437 9.06587 3.62904 9.17381 3.65575 9.27529L3.66253 9.30033C3.67564 9.35057 3.69852 9.39773 3.72988 9.43912C3.76123 9.4805 3.80044 9.5153 3.84525 9.54151C3.89007 9.56773 3.93962 9.58484 3.99106 9.59188C4.04249 9.59892 4.09482 9.59575 4.14503 9.58255L6.96178 8.84022C7.06248 8.814 7.16946 8.82843 7.25962 8.88039L8.55481 9.6295V9.63263L8.60697 9.66289C8.66708 9.69766 8.71699 9.74763 8.75168 9.80779C8.78638 9.86794 8.80464 9.93617 8.80464 10.0056C8.80464 10.0751 8.78638 10.1433 8.75168 10.2034C8.71699 10.2636 8.66708 10.3136 8.60697 10.3483L7.22207 11.1491C7.132 11.2013 7.02491 11.2158 6.92422 11.1893L4.14712 10.4589C4.0969 10.4457 4.04458 10.4426 3.99314 10.4496C3.9417 10.4566 3.89216 10.4738 3.84734 10.5C3.80252 10.5262 3.76332 10.561 3.73196 10.6024C3.70061 10.6438 3.67772 10.6909 3.66462 10.7412L3.65784 10.7662C3.64454 10.8164 3.64128 10.8688 3.64824 10.9203C3.6552 10.9718 3.67225 11.0215 3.69842 11.0664C3.72458 11.1113 3.75934 11.1506 3.80071 11.1821C3.84208 11.2136 3.88924 11.2366 3.93951 11.2498L5.1481 11.568C5.22392 11.588 5.29208 11.6301 5.34395 11.6889C5.39581 11.7477 5.42905 11.8206 5.43944 11.8983C5.44984 11.9761 5.43692 12.0551 5.40232 12.1255C5.36773 12.1959 5.31302 12.2544 5.24513 12.2936L3.2035 13.4741C3.15852 13.5001 3.11909 13.5347 3.08748 13.5759C3.05587 13.6172 3.0327 13.6642 3.01928 13.7144C3.00586 13.7646 3.00246 13.8169 3.00928 13.8685C3.0161 13.92 3.033 13.9696 3.05901 14.0146L3.07153 14.0375C3.12402 14.1282 3.21031 14.1944 3.31151 14.2216C3.4127 14.2488 3.52055 14.2348 3.61141 14.1826L5.67911 12.9864C5.74701 12.9472 5.82503 12.929 5.90326 12.9343C5.98149 12.9395 6.05639 12.9679 6.11845 13.0158C6.18051 13.0638 6.22692 13.129 6.25179 13.2034C6.27666 13.2778 6.27886 13.3578 6.25811 13.4334L5.9175 14.6818C5.88998 14.783 5.90367 14.891 5.95558 14.9821C6.0075 15.0732 6.0934 15.14 6.19448 15.168L6.22003 15.1748C6.32116 15.2022 6.42906 15.1884 6.52002 15.1364C6.61098 15.0844 6.67756 14.9983 6.70514 14.8972L7.47245 12.0803C7.49968 11.9796 7.56571 11.8939 7.65605 11.8419L8.97628 11.0782V11.0818L9.00601 11.0641C9.06614 11.0293 9.13435 11.0111 9.20378 11.0111C9.2732 11.0111 9.34141 11.0294 9.40152 11.0641C9.46164 11.0989 9.51155 11.1488 9.54623 11.209C9.58091 11.2691 9.59914 11.3374 9.59909 11.4068V12.9666C9.59921 13.0709 9.55794 13.1711 9.48434 13.2451L7.46358 15.2885C7.38986 15.3631 7.34875 15.464 7.34924 15.5689C7.34973 15.6738 7.39178 15.7743 7.46619 15.8482L7.48496 15.867C7.55909 15.941 7.65955 15.9826 7.76429 15.9826C7.86903 15.9826 7.96949 15.941 8.04362 15.867L8.92307 14.9802C8.97803 14.9236 9.04867 14.8848 9.1259 14.8687C9.20313 14.8526 9.2834 14.8601 9.35636 14.89C9.42933 14.92 9.49164 14.9711 9.53527 15.0369C9.57891 15.1026 9.60186 15.1799 9.60118 15.2587V17.6203C9.60118 17.7251 9.64276 17.8256 9.7168 17.8997C9.79084 17.9739 9.89127 18.0156 9.99605 18.0157H10.0221C10.1269 18.0156 10.2273 17.9739 10.3014 17.8997C10.3754 17.8256 10.417 17.7251 10.417 17.6203V15.2233C10.4166 15.1445 10.4397 15.0674 10.4834 15.0019C10.527 14.9363 10.5893 14.8853 10.6621 14.8554C10.735 14.8254 10.8151 14.8179 10.8923 14.8339C10.9694 14.8498 11.04 14.8884 11.0951 14.9447L12.0038 15.8644C12.0779 15.9384 12.1784 15.98 12.2831 15.98C12.3878 15.98 12.4883 15.9384 12.5624 15.8644L12.5812 15.8456C12.6557 15.7717 12.6979 15.6712 12.6984 15.5663C12.6988 15.4613 12.6576 15.3605 12.5838 15.2859L10.5338 13.2128C10.4603 13.1387 10.4191 13.0386 10.4191 12.9342V11.3917C10.4189 11.3223 10.4371 11.254 10.4717 11.1938C10.5063 11.1337 10.5562 11.0837 10.6163 11.0489C10.6763 11.0142 10.7445 10.9959 10.8139 10.9959C10.8834 10.9959 10.9516 11.0142 11.0116 11.0489L12.3454 11.8205C12.4356 11.8727 12.5016 11.9583 12.529 12.0589L13.2854 14.8336C13.313 14.9347 13.3795 15.0207 13.4705 15.0728C13.5615 15.1248 13.6694 15.1386 13.7705 15.1111L13.796 15.1043C13.8972 15.0765 13.9832 15.0097 14.0351 14.9186C14.0871 14.8274 14.1007 14.7193 14.073 14.6181L13.7439 13.411C13.7231 13.3354 13.7252 13.2554 13.75 13.181C13.7748 13.1067 13.8212 13.0414 13.8832 12.9934C13.9452 12.9454 14.02 12.917 14.0982 12.9116C14.1764 12.9063 14.2544 12.9243 14.3224 12.9634L16.3609 14.1476C16.4058 14.1736 16.4554 14.1904 16.5068 14.1972C16.5583 14.204 16.6105 14.2005 16.6606 14.187C16.7107 14.1736 16.7577 14.1503 16.7988 14.1187C16.8399 14.087 16.8744 14.0476 16.9002 14.0026L16.9133 13.9802C16.9657 13.8893 16.9799 13.7814 16.9528 13.68C16.9257 13.5787 16.8595 13.4923 16.7688 13.4397L14.7011 12.2435C14.6337 12.2043 14.5794 12.146 14.545 12.0759C14.5106 12.0059 14.4977 11.9273 14.5078 11.8499C14.5179 11.7726 14.5507 11.7 14.602 11.6412C14.6532 11.5824 14.7207 11.54 14.796 11.5195L16.0479 11.1903C16.1493 11.1635 16.236 11.0975 16.2888 11.0068C16.3416 10.9161 16.3563 10.8082 16.3296 10.7067" fill="white"/>
    </g>
    </svg>
    <span>${label}</span>
  `;

  button.addEventListener('click', function () {
    chrome.storage.local.get([tabID.toString()], function (result) {
      const v = result[tabID.toString()];
      if (!v) {
        console.error("No request data found for tab", tabID);
        return;
      }

      const count = getCount();
      if (count !== null) {
        v.data.count = count;
      }

      // Store clean URL (without hash fragment)
      const cleanHref = window.location.origin + window.location.pathname + window.location.search;
      v.data.href = cleanHref;

      const uniqueId = crypto.randomUUID();
      chrome.storage.local.set({ [uniqueId]: v }, function () {
        let targetUrl = `${url}?id=${uniqueId}&extension=${extensionID}`;

        const mode = button.dataset.mode || "extract";
        const jobId = button.dataset.jobId || null;

        if (mode === "resume" && jobId) {
          targetUrl += `&mode=resume&job=${encodeURIComponent(jobId)}`;
        }

        window.open(targetUrl, "_blank");

      });
    });
  });

  return button;
}

function addButtonStyles() {
  const styles = `
    .export-button {
      background-color: rgb(17, 121, 252);
      border: none;
      color: white;
      white-space: nowrap;
      min-width: max-content;
      padding: 8px 12px;
      height: 32px;
      text-align: center;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      font-size: 14px;
      margin: 8px 8px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.3s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .export-button:hover { 
      background-color: rgb(14, 103, 214); 
    }
    .export-button:active { 
      background-color: rgb(12, 85, 176); 
    }
    .export-button-icon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
  `;
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

// Add button styles
addButtonStyles();

function addButtonToPage(button, fallback = false) {
  const targets = [
    ".lists-nav div.mlA",
    ".global-typeahead"
  ];

  for (const selector of targets) {
    const target = document.querySelector(selector);
    if (!target) {
      continue;
    }
    if (selector.includes("mlA")) {
      target.prepend(button);
    } else {
      target.parentElement.prepend(button);
    }
    return true;
  }

  if (!fallback) return false;

  // Fallback: Place the button at the bottom right corner of the page
  document.body.appendChild(button);
  Object.assign(button.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '9999'
  });

  return true;
}

// Check and add button to the page with a retry mechanism
function checkAndAddButton(retries = 10, delay = 500) {
  if (document.getElementById(buttonID)) return;

  // Ask the background script for the tab ID and extension ID
  chrome.runtime.sendMessage({ action: "GET_IDS" }, function (response) {
    if (!response) {
      console.error("No response from background for GET_IDS");
      return;
    }

    // Extract mode/jobId from the hash fragment ONCE (cached) and clean it
    const { mode, jobId } = getModeAndJobFromHashOnce();

    // Create the button with correct mode
    const button = createButton(
      response.tabId,
      response.extensionId,
      mode,
      jobId
    );

    // Try to add the button to the page
    if (addButtonToPage(button, retries === 0)) {
      return;
    }

    // Retry mechanism
    if (retries > 0) {
      setTimeout(() => checkAndAddButton(retries - 1, delay), delay);
      return;
    }

    // Failed to add button after all retries
    console.error("Failed to add button to the page after all retries");
  });
}

function isTargetURL(url) {
  return url.startsWith("https://www.linkedin.com/sales/lists/people/") ||
    url.startsWith("https://www.linkedin.com/sales/search/people?") ||
    url.startsWith("https://linkedin.com/sales/lists/people/") ||
    url.startsWith("https://linkedin.com/sales/search/people?");
}

// Check URL and add button when DOM is loaded
if (isTargetURL(window.location.href)) {
  // Check if the DOM is already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => checkAndAddButton());
  } else {
    checkAndAddButton();
  }
}

// Listen for URL changes
let lastUrl = window.location.href;
new MutationObserver(() => {
  const url = window.location.href;

  // Ignore changes that only modify the hash (or remove it)
  const baseUrl = url.split('#')[0];
  const lastBaseUrl = lastUrl.split('#')[0];

  if (baseUrl === lastBaseUrl) {
    // Same page, only hash changed/removed → do nothing
    lastUrl = url;
    return;
  }

  // Prevent multiple executions on exactly the same URL
  if (url === lastUrl) return;

  // Real navigation: update lastUrl
  lastUrl = url;

  // Check if the URL is a target URL
  if (!isTargetURL(url)) {
    // Remove the button if it exists
    const button = document.getElementById(buttonID);
    if (button) {
      button.remove();
    }
    return;
  }

  // Real navigation *within* target URLs -> reset to default
  cachedModeJob = { mode: "extract", jobId: null };

  const existingButton = document.getElementById(buttonID);
  if (existingButton) {
    existingButton.dataset.mode = "extract";
    delete existingButton.dataset.jobId;

    const span = existingButton.querySelector("span");
    if (span) {
      span.textContent = "Export with Emailchaser";
    }
  }

  // Add the button if needed
  checkAndAddButton();

}).observe(document, { subtree: true, childList: true });
