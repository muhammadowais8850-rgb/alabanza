// Run: npm run check  (Node 24 strips the TS types on import)
import assert from "node:assert/strict";
import { formatMoney, localUrl } from "../lib/shopify.ts";
import { personalizationFor } from "../lib/personalization.ts";
import { parseReviews } from "../lib/reviews.ts";

assert.equal(formatMoney({ amount: "1850.0", currencyCode: "PKR" }), "Rs.1,850.00");
assert.equal(formatMoney({ amount: "999", currencyCode: "PKR" }), "Rs.999.00");
assert.equal(localUrl("https://thealabanza.com/collections/watches"), "/collections/watches");
assert.equal(localUrl("https://thealabanza.com/"), "/");
assert.equal(personalizationFor("two-halves-one-heart"), "couple-engraving");
assert.equal(personalizationFor("custom-name-necklace"), "personalized");
assert.equal(personalizationFor("emerald-original"), null);
const [r] = parseReviews("<div class='jdgm-rev x' data-review-id='a1'> <span class='jdgm-rev__rating' data-score='4'></span> <span class='jdgm-rev__author'>Ali &amp; Sara</span> <div class='jdgm-rev__body'><p>Very nice</p></div> <img class='jdgm-rev__pic-img' alt='x' data-src='https://i.test/p.jpg?quality=80&amp;width=160'>");
assert.deepEqual([r.id, r.score, r.author, r.body, r.pic], ["a1", 4, "Ali & Sara", "Very nice", "https://i.test/p.jpg?quality=80&width=200"]);
console.log("check: ok");
