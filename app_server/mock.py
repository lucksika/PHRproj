weight = 50

def get_nutrient_limit():
	limit = {
		"sodium": {"minVal": 2, "maxVal": 3},
		"protein": {"minVal": round(1.1*weight, 2), "maxVal": round(1.4*weight,2)},
		"carbohydrate": {"minVal": 0, "maxVal": 0},
		"potassium": {"minVal": round(70.0*weight/1000,2), "maxVal": round(90.0*weight/1000,2)},
		"phosphorus": {"minVal": 0, "maxVal": round(float(17.0*weight/1000), 2)},
		"fat": {"minVal": 0, "maxVal": 0},
		"calories": {"minVal": round(30*weight,2), "maxVal": round(35*weight, 2)},
	}

	return limit