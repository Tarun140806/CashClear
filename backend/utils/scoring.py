from datetime import date, datetime


def score_obligation(obligation: dict) -> float:
	"""Calculate a priority score for a financial obligation."""
	if not isinstance(obligation, dict):
		obligation = {}

	# 1) Penalty score: penalty_if_late / 1000, capped at 30.
	raw_penalty = obligation.get("penalty_if_late", 0)
	try:
		penalty_value = float(raw_penalty) if raw_penalty is not None else 0.0
	except (TypeError, ValueError):
		penalty_value = 0.0
	penalty_score = min(30.0, max(0.0, penalty_value / 1000.0))

	# 2) Flexibility score: low=20, medium=10, high=0. Default to medium.
	raw_flexibility = obligation.get("flexibility", "medium")
	flexibility = str(raw_flexibility).strip().lower() if raw_flexibility is not None else "medium"
	flexibility_map = {
		"low": 20.0,
		"medium": 10.0,
		"high": 0.0,
	}
	flexibility_score = flexibility_map.get(flexibility, 10.0)

	# 3) Urgency score from due_date; invalid/missing dates default to 0.
	urgency_score = 0.0
	raw_due_date = obligation.get("due_date")
	if raw_due_date:
		try:
			due_date = datetime.strptime(str(raw_due_date).strip(), "%Y-%m-%d").date()
			days_remaining = (due_date - date.today()).days

			if days_remaining < 0:
				urgency_score = 30.0
			elif days_remaining == 0:
				urgency_score = 25.0
			else:
				urgency_score = float(max(0, 30 - days_remaining))
		except (TypeError, ValueError):
			urgency_score = 0.0

	# 4) Total score.
	total_score = penalty_score + flexibility_score + urgency_score
	return float(total_score)
