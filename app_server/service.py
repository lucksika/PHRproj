import matplotlib
import matplotlib.pyplot as plt
import datetime as dt
import numpy as np
import base64

def generate_info_nutrient_linechart(data, minValue, maxValue, begin, amount):
	dic = {}
	_list = []
	last_date = ''
	dateList = sorted(data.keys())
	dic['date'] = []
	dic['points'] = []
	dic['min'] = []
	dic['max'] = []
	i = 0
	_amount = amount
	for date in dateList:
		_formatted_date = dt.datetime.strptime(date, "%Y-%m-%d")
		while i < _amount:
			_date = begin + dt.timedelta(days=i)
			if _formatted_date != _date:
				dic.get('date').append(_date.strftime("%Y-%m-%d"))
				dic.get('points').append(0)
				dic.get('min').append(minValue)
				dic.get('max').append(maxValue)
				i += 1
			else:
				break
		last_date = dt.datetime.strptime(date, "%Y-%m-%d")
		dic.get('date').append(date)
		dic.get('points').append(data.get(date))
		dic.get('min').append(minValue)
		dic.get('max').append(maxValue)
		i += 1
	while i < _amount:
		_date = last_date + dt.timedelta(days=i)
		dic.get('date').append(_date.strftime("%Y-%m-%d"))
		dic.get('points').append(0)
		dic.get('min').append(minValue)
		dic.get('max').append(maxValue)
		i += 1

	_list.append(dic)

	return _list

def generate_info_result_linechart(data):
	_data = data
	# print "data", data
	# print "_data", _data
	_list = []
	for item in data:
		dic = {}
		dic['title'] = item
		# print _data[item].keys()
		dateList = sorted(_data[item].keys())
		dic['date'] = dateList
		dic['limits'] = []
		dic['points'] = []
		for date in dateList:
			arr = np.array((_data[item].get(date).split(',')))
			value = arr.astype(np.float)
			dic.get('points').append(value[0])
			dic.get('limits').append(value[1])
		_list.append(dic)

	return _list

def generate_key_value(data_dic):
	data_list = []
	for item in list(data_dic):
		data = {}
		for key in item:
			print key
			data['date'] = key.split('_')[2]
			data['description'] = item[key]['treatment']['appointment']
			data_list.append(data)	
			
	return data_list

def get_nutrients_minmax(limit_list):
	result = {}
	for key in limit_list:
		maxValue = limit_list.get(key).get("maxVal")
		minValue = limit_list.get(key).get("minVal")
		result[key] = {"maxValue": maxValue, "minValue": minValue}
		
	return result


def summary_per_day(result, columnFamily):
	dic = {}
	for item in list(result):
		for key in item:
			splitKey = (item[key].get(columnFamily))
			for d in splitKey:
				if dic.has_key(d):
					dic[d] += float(splitKey[d])
				else:
					dic[d] = 0
					dic[d] += float(splitKey[d])

	# print dic

	return dic

def group_by_key(result, columnFamily):
	dic = {}
	flag = ''
	state = 0
	for item in list(result):
		for key in item:
			title = item.get(key).get(columnFamily).keys()[0]
			value = item.get(key).get(columnFamily).get(title)
			# splitKey -> date			
			date = key.split('_')[2]
			
			if title in dic:
				dic[title].update({date : value})
			else: 
				dic[title] = {date : value}

	return dic

def summary_by_date(result, columnFamily, title):
	dic = {}
	summary = 0.0
	flag = ''
	state = 0
	# print "list(result), " , list(result)
	for item in list(result):

		for key in item:
			# splitKey -> date			
			splitKey = key.split('_')[2]

			if(flag != '' and flag != splitKey):
				state = 2
			if(state == 0):
				flag = splitKey
				summary += float(item.get(key).get(columnFamily).get(title))
				state = 1
			elif(state == 1):
				summary += float(item.get(key).get(columnFamily).get(title))
			elif(state == 2):
				dic["{}".format(flag)] = summary
				flag = splitKey
				summary = 0.0
				summary += float(item.get(key).get(columnFamily).get(title))
				state = 1
    
	# last item of dictionary
	dic["{}".format(flag)] = summary
	return dic
# dic 
# {
#     "2016-11-09": 60.0,
#     "2016-11-12": 45.0,
#     "2016-11-13": 55.0,
#     "2016-11-10": 66.0,
#     "2016-11-11": 55.0,
#     "2016-11-14": 60.0,
#     "2016-11-15": 60.0
# }

def generate_date_value_list(data_dic, begin, amount):
	dic = data_dic if data_dic else data_dic.append({})
	print "dic, ", dic
	graphDate = []
	value = []
	date_value = []
	i = 0
	_amount = amount
	last_date = ''
	print amount
	for key in sorted(dic):
		# print "key, ", key
		date = dt.datetime.strptime(key, "%Y-%m-%d")
		print "date, ", date
		# print date
		while i < _amount:
			_date = begin + dt.timedelta(days=i)
			
			print _date
			if date != _date:
				graphDate.append(_date)
				value.append(0)
				i += 1
			else:
				break
		last_date = date
		graphDate.append(date)
		value.append(dic.get(key))
		i += 1
	
	while i < _amount:
		_date = last_date + dt.timedelta(days=i)
		graphDate.append(_date)
		value.append(0)
		i += 1

	date_value.append(graphDate)
	date_value.append(value)
	return date_value

def generate_linechart_img(title, date_list, value_list, xlabel, ylabel, chart_title, maxValue, minValue, amount):
	img_path = 'img/value-{}.png'.format(title)
	encoded_string = ""
	print value_list
	x = np.array(range(0, amount))
	y = np.array(value_list)

	my_xticks = [date.strftime("%b %d, %y") for date in date_list]

	plt.xticks(x, my_xticks, rotation=25, fontsize=12)
	plt.yticks(y, fontsize=12)
	plt.xlabel(xlabel, fontsize=12)
	plt.ylabel(ylabel, fontsize=12)
	plt.tight_layout()
	
	plt.title(chart_title)
	# plt.title("sodium (min: {}, max: {})".format(minValue, maxValue))
	plt.fill_between(x, minValue, maxValue, facecolor='#C8FFDA')
	# plt.tight_layout()
	lines = plt.plot(x, y)
	plt.setp(lines, linewidth=5, color="#7CAFE6")
	plt.savefig('img/value-{}.png'.format(title))
	plt.clf()

	return img_path