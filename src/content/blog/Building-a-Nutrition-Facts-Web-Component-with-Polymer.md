---
title: Building a Nutrition Facts Web Component with Polymer
author: Rachel Cantor
pubDatetime: 2014-11-03T05:00:00.000Z
tags:
  - web components
  - polymer
---

I created the \<nutrition-facts> component during GDG New York DevFest as part of an exploration into using Polymer to build reusable, data-driven web components. The event was a great opportunity to understand how custom elements could be used to simplify complex data handling, like importing and displaying nutrition facts from JSON.

When building web components, we often need a way to handle data, especially for something like nutrition facts, where information must be structured and reusable. In this post, I’ll walk through how I built a nutrition facts component using Polymer, utilizing a custom service element `<nutrition-facts-service>` to import food data as JSON.

## Why Polymer?

Polymer gives us the ability to create reusable components and taking advantage of the shadow DOM despite there not being widespread support for web components just yet. It’s ideal for a nutrition facts component, as we can isolate the logic and UI in a single element, ensuring it’s both portable and maintainable.

### Step 1: Creating the Nutrition Facts Service

The delivery of the data itself gets handled by the `<nutrition-facts-service>`. This service provides a simple API to access nutrition data and update it as needed.

* facts: Returns the list of nutrition facts.
* updateFacts: Retrieves a JSON file, allowing you to easily update or replace the facts.

```json
{
  "item_name": "Cola, Cherry",
    "brand_name": "Coke",
      "ingredients": "Carbonated Water, High Fructose Corn Syrup and/or Sucrose, Caramel Color, Phosphoric Acid, Natural Flavors, Caffeine.",
        "calories": 100,
        "calories_from_fat": 0,
        "total_fat": 0,
        "saturated_fat": null,
        "cholesterol": null,
        "sodium": 25,
        "total_carbohydrate": 28,
        "dietary_fiber": null,
        "sugars": 28,
        "protein": 0,
        "vitamin_a_dv": 0,
        "vitamin_c_dv": 0,
        "calcium_dv": 0,
        "iron_dv": 0,
        "servings_per_container": 6,
        "serving_size_qty": 8,
        "serving_size_unit": "fl oz"
}
```

### Step 2: Building the UI Component

With the service created, we can now build the UI to display the nutrition facts. This involves using Polymer to bind the data returned by \<nutrition-facts-service> to a custom nutrition facts component:

```html
<nutrition-facts-service id="nutritionService"></nutrition-facts-service>
<nutrition-facts-display facts="[[nutritionService.facts]]"></nutrition-facts-display>
```

### Step 3: Displaying the Data

We need to create the \<nutrition-facts-display> component, which will present the fetched data in a user-friendly format.

![](/uploads/NutritionFacts.png)

You can view the full source code on GitHub: [Nutrition Facts](https://github.com/rachelslurs/nutrition-facts).

The demo is here: [Nutrition Facts Demo](https://rachelslurs.github.io/nutrition-facts/demo.html)
