weight = 50

def get_nutrient_limit():
	limit = {
		"sodium": {"minVal": 2, "maxVal": 3},
		"protein": {"minVal": 1.1*weight, "maxVal": 1.4*weight},
		"carbohydrate": {"minVal": 0, "maxVal": 0},
		"potassium": {"minVal": 70.0*weight/1000, "maxVal": 90.0*weight/1000},
		"phosphorus": {"minVal": 0, "maxVal": float(17.0*weight/1000)},
		"fat": {"minVal": 0, "maxVal": 0},
		"calories": {"minVal": 30*weight, "maxVal": 35*weight},
	}

	return limit