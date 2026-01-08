# HabitLab
Test changes. Measure results. Improve your life.

> “I built a personal experimentation platform that tracks how lifestyle changes affect focus, mood, and productivity using time-series data and statistical comparisons.”

## Tech Stack
- React Native ([Expo.dev](https://expo.dev))
- Django ([Django docs](https://djangoproject.com))
- Turborepo ([Turborepo docs](https://turborepo.com/docs))
- Unistyles ([Unistyles docs](https://www.unistyl.es/v3/start/introduction/))
- Victory Native ([Victory Native docs](https://nearform.com/open-source/victory-native/docs/))
- 

## Features
-
-
-

## DB Schema
1. users
	- id  
	- name  
	- email  
	- password_hash  
	- created_at  
 	- updated_at  
1. experiments
	- id  
	- user_id  
	- title  
	- rule  
	- goal  
	- start_date  
	- end_date  
	- status   (active, paused, completed)  
	- created_at  
	- updated_at (optional)  
1. daily_logs
	- id  
	- user_id  
	- date  
	- sleep_hours  
	- deep_work_minutes  
	- mood (1–5)  
	- workout (boolean)  
	- screen_time_minutes  
	- created_at  
1. experiment_days
	- id  
	- experiment_id  
	- date  
	- followed   (true / false / null)  

