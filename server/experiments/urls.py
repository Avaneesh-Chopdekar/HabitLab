from django.urls import path

from .views import (
    CurrentExperimentView,
    DailyCheckinView,
    ExperimentResultView,
    StartExperimentView,
    UpdateBaselineView,
    UserExperimentsView,
)

urlpatterns = [
    path("start/", StartExperimentView.as_view()),
    path("current/", CurrentExperimentView.as_view()),
    path("checkin/", DailyCheckinView.as_view()),
    path("result/<int:exp_id>/", ExperimentResultView.as_view()),
    path("baseline/", UpdateBaselineView.as_view()),
    path("all/", UserExperimentsView.as_view()),
]
