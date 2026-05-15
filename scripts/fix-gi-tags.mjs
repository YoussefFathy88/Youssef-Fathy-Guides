import fs from "fs";

const p = "components/session/gradient-instability-mini.tsx";
let s = fs.readFileSync(p, "utf8");

const bad = "</" + "motion.div>";
const good = "</" + "motion.div>".replace("motion.", "");

const pairs = [
  ["deeper in stack</span>\n      " + bad, "deeper in stack</span>\n      " + good],
  ['tone="rose" reducedMotion={reducedMotion} />\n      ' + bad, 'tone="rose" reducedMotion={reducedMotion} />\n      ' + good],
  [
    "weights jump too far\n      </p>\n    " + bad + "\n  );\n}\n\nfunction VanishStory",
    "weights jump too far\n      </p>\n    " + good + "\n  );\n}\n\nfunction VanishStory",
  ],
  ['tone="slate" reducedMotion={reducedMotion} />\n      ' + bad, 'tone="slate" reducedMotion={reducedMotion} />\n      ' + good],
  [
    "died on the way back\n      </p>\n    " + bad + "\n  );\n}\n\nfunction LayerNormStory",
    "died on the way back\n      </p>\n    " + good + "\n  );\n}\n\nfunction LayerNormStory",
  ],
  [
    "before every sub-layer\n      </p>\n    " + bad + "\n  );\n}\n\nexport function GradientInstabilityMini",
    "before every sub-layer\n      </p>\n    " + good + "\n  );\n}\n\nexport function GradientInstabilityMini",
  ],
];

for (const [from, to] of pairs) {
  if (!s.includes(from)) console.warn("missing:", from.slice(0, 55));
  else s = s.replace(from, to);
}

fs.writeFileSync(p, s);
console.log("done, good tag is", good);
