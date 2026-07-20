import re


STYLE_KEYWORDS = {
    "indo-western": [
        "indian",
        "indo western",
        "indo-western",
        "desi",
        "ethnic",
    ],
    "streetwear": [
        "streetwear",
        "street style",
        "urban",
    ],
    "minimalist": [
        "minimalist",
        "minimal",
        "simple",
        "clean look",
    ],
    "old-money": [
        "old money",
        "old-money",
        "quiet luxury",
    ],
    "y2k": [
        "y2k",
        "2000s",
        "retro 2000",
    ],
    "formal": [
        "formal",
        "professional",
        "corporate",
    ],
    "casual": [
        "casual",
        "everyday",
        "relaxed",
    ],
    "elegant": [
        "elegant",
        "classy",
        "sophisticated",
    ],
    "athleisure": [
        "athleisure",
        "sporty",
        "activewear",
    ],
}


OCCASION_KEYWORDS = {
    "college_farewell": [
        "college farewell",
        "farewell",
    ],
    "wedding": [
        "wedding",
        "shaadi",
        "marriage",
    ],
    "interview": [
        "interview",
        "job interview",
    ],
    "festival": [
        "festival",
        "festive",
        "diwali",
        "holi",
        "navratri",
        "durga puja",
        "onam",
        "pongal",
    ],
    "concert": [
        "concert",
        "music festival",
    ],
    "date": [
        "date night",
        "date",
    ],
    "college": [
        "college",
        "campus",
    ],
    "office": [
        "office",
        "work",
        "workplace",
    ],
    "party": [
        "party",
        "club",
        "night out",
    ],
}


ACTION_KEYWORDS = {
    "complete_look": [   
    "complete the look",
    "complete this look",
    "complete my look",
    "complete outfit",
    "complete this outfit",
    "complete my outfit",
    "complete the outfit",
    "complete the missing parts",
    "missing parts of this outfit",
    "finish the look",
    "finish this look",
    "finish my look",
    "add accessories",
    "what is missing",
    "suggest missing items",
],
    "transform_style": [
        "make this more",
        "make it more",
        "change the style",
        "transform",
        "convert this",
    ],
    "recreate_look": [
        "recreate",
        "recreate this look",
        "find similar",
        "same look",
    ],
    "match_personal_style": [
        "match my style",
        "my personal style",
        "according to my style",
        "personalize this",
        "make it mine",
    ],
}


ITEM_KEYWORDS = [
    "top",
    "shirt",
    "t-shirt",
    "tshirt",
    "blouse",
    "kurta",
    "jacket",
    "blazer",
    "dress",
    "skirt",
    "jeans",
    "trousers",
    "pants",
    "shorts",
    "shoes",
    "sneakers",
    "heels",
    "sandals",
    "bag",
    "handbag",
    "earrings",
    "necklace",
    "bracelet",
    "watch",
]


def extract_budget(prompt: str):
    patterns = [
        r"(?:under|below|within|max|maximum|budget(?:\s+of)?)\s*₹?\s*(\d+(?:,\d+)?)\s*k?",
        r"₹\s*(\d+(?:,\d+)?)\s*k?",
        r"(\d+(?:,\d+)?)\s*(?:rupees|rs)",
    ]

    prompt_lower = prompt.lower()

    for pattern in patterns:
        match = re.search(pattern, prompt_lower)

        if match:
            raw_value = match.group(1).replace(",", "")
            value = int(raw_value)

            matched_text = match.group(0)

            if re.search(r"\d+\s*k\b", matched_text):
                value *= 1000

            return value

    return None


def extract_target_style(prompt: str):
    prompt_lower = prompt.lower()

    for style, keywords in STYLE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in prompt_lower:
                return style

    return None


def extract_occasion(prompt: str):
    prompt_lower = prompt.lower()

    for occasion, keywords in OCCASION_KEYWORDS.items():
        for keyword in keywords:
            if keyword in prompt_lower:
                return occasion

    return None


def extract_actions(prompt: str):
    prompt_lower = prompt.lower()
    actions = []

    for action, keywords in ACTION_KEYWORDS.items():
        if any(keyword in prompt_lower for keyword in keywords):
            actions.append(action)

    return actions


def extract_preserve_items(prompt: str):
    prompt_lower = prompt.lower()
    preserve_items = []

    preserve_patterns = [
        r"keep (?:the |my )?([a-zA-Z\- ]+?)(?: but| and|,|$)",
        r"preserve (?:the |my )?([a-zA-Z\- ]+?)(?: but| and|,|$)",
        r"don't change (?:the |my )?([a-zA-Z\- ]+?)(?: but| and|,|$)",
    ]

    for pattern in preserve_patterns:
        matches = re.findall(pattern, prompt_lower)

        for match in matches:
            item_phrase = match.strip()

            if any(
                item in item_phrase
                for item in ITEM_KEYWORDS
            ):
                preserve_items.append(item_phrase)

    return list(dict.fromkeys(preserve_items))


def extract_replace_items(prompt: str):
    prompt_lower = prompt.lower()
    replace_items = []

    for item in ITEM_KEYWORDS:
        patterns = [
            rf"replace (?:the |my )?{re.escape(item)}",
            rf"change (?:the |my )?{re.escape(item)}",
            rf"different {re.escape(item)}",
        ]

        if any(
            re.search(pattern, prompt_lower)
            for pattern in patterns
        ):
            replace_items.append(item)

    return list(dict.fromkeys(replace_items))


def parse_fashion_intent(prompt: str):
    target_style = extract_target_style(prompt)
    actions = extract_actions(prompt)

    if target_style and "transform_style" not in actions:
        actions.append("transform_style")

    return {
        "original_prompt": prompt,
        "target_style": target_style,
        "actions": actions,
        "budget_max": extract_budget(prompt),
        "occasion": extract_occasion(prompt),
        "preserve_items": extract_preserve_items(prompt),
        "replace_items": extract_replace_items(prompt),
    }