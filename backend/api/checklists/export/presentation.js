
const MINOR_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "but", "by", "for", "from", "in",
  "is", "of", "on", "or", "the", "to", "with",
]);


export function cleanText(value) {
  return String(value ?? "")
    .replace(/[\t\r\n]+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleCase(value) {
  const words = cleanText(value).split(" ");
  return words
    .map((word, index) => {
      if (!word) return word;

      if (word.startsWith("(")) return word;

      if (/^[A-Z][A-Z/&.-]{3,}$/.test(word)) {
        return word.charAt(0) + word.slice(1).toLowerCase();
      }

      if (/[A-Z]/.test(word.slice(1))) return word;
      const lower = word.toLowerCase();
      if (index > 0 && MINOR_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}


export function sectionHeading(entry) {
  const base = cleanText(entry?.name);
  const qualifier = cleanText(entry?.config?.name);
  if (!qualifier || qualifier.startsWith("(")) return titleCase(base);

  const baseWords = new Set((base.toLowerCase().match(/[a-z0-9]+/g) || []));
  const qualifierWords = qualifier.toLowerCase().match(/[a-z0-9]+/g) || [];
  if (qualifierWords.length && qualifierWords.every((word) => baseWords.has(word))) {
    return titleCase(base);
  }
  return titleCase(`${base} ${qualifier}`);
}


export function summaryHeading(entry) {
  const raw = cleanText(entry?.config?.name).replace(/^SF[\s-]*/i, "");
  return raw ? `${titleCase(raw)} Summary` : "Summary";
}

const DOCUMENT_OVERRIDES = {
  "FM / MFG / PKG_MONO / H-1": {
    title: "MONO CARTON LOGBOOK",
    headings: {
      "Record Detail": "Record Details",
      "Checks to Be Carried Out Before Starting Mono Cartoning Activity": "Checks Before Starting",
    },
    // Keyed by section field id, falling back to the cleaned field name.
    labels: {
      // Order details
      "field-1781521898455-zkvk44r": "Supply/Change Time",
      "field-1781521899355-3yf84jv": "Qty Supplied",
      "field-1781521924068-sp69cnq": "Glue Lot/IBD",
      "field-1781521925333-dcjdw9s": "Qty Used",
      "field-1781521996616-fjbfn1b": "Qty Waste",
      // Checks before starting
      "field-1783500864969-7rm80ar": "Packaging material removed and area cleared",
      "field-1781522065950-su1o4vs": "Issued mono cartons are correct and suitable",
      "field-1781522099607-5wqezrp": "No off odour or foul smell",
      "field-1781522100759-9yatds2": "No physical defect or colour issue",
      "field-1781522103157-mu7wysx": "WIP product is intact and undamaged",
      "field-1781522106475-j5lmma5": "Pallets are clean and free from dust/dirt",
      "field-1781522107590-3hxsg6x": "Date-code printer details are correct",
      "field-1781522139181-rbu38ic": "Carton weighing scale works correctly",
      "field-1781522140499-ltdwxoh": "Gross carton weight matches the SKU",
      "field-1781522141398-5ggh3uc": "Glue tank temperature reached set point",
      "field-1781522170223-y619ggu": "Glue nozzle temperature reached set point",
      // Checks during operation
      "field-1781522297786-nhf5kl7": "Glue Nozzle Temperature",
      // Output details
      "field-1781522409996-57ntluu": "SKU (g)",
      "field-1781522442655-sf8au52": "Final Packing Date",
      "field-1781522452252-ij6s2n1": "Batch Code",
      "field-1781522466899-7bvwfvq": "WIP Packing Date",
      "field-1781522481380-v0l5rpm": "WIP Batch",
      "field-1781522566833-ml2ruvz": "Cartons Pack",
      "field-1781522717103-1zeqts2": "Output (kg)",
      // Output summary
      "Sum of output in kg": "Sum of Output (kg)",
      // Standalone entries
      "ISSUES FACED": "Issue Description",
    },
  },
};

export function presentationFor(documentNumber) {
  const overrides = DOCUMENT_OVERRIDES[cleanText(documentNumber)] || {};
  const headings = overrides.headings || {};
  const labels = overrides.labels || {};

  return {
    documentTitle(title) {
      return overrides.title || cleanText(title).toUpperCase();
    },
    heading(text) {
      return headings[text] || text;
    },
    label(field) {
      const name = cleanText(field?.name);
      return labels[field?.id] || labels[field?.entryId] || labels[name] || titleCase(name);
    },
  };
}
