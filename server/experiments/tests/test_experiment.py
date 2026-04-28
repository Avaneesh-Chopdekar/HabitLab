from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from experiments.models import UserExperiment

User = get_user_model()


class ExperimentFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            email="test@test.com", username="test", password="password123"
        )

        self.client.force_authenticate(user=self.user)

        # create experiment
        self.exp = UserExperiment.objects.create(
            user=self.user,
            title="Test Experiment",
            duration_days=7,
            baseline_snapshot={},
            status="active",
        )

    # 🔁 TOGGLE TESTS

    def test_pause_experiment(self):
        url = "/api/experiments/toggle/"
        res = self.client.post(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.exp.refresh_from_db()
        self.assertEqual(self.exp.status, "paused")

    def test_resume_experiment(self):
        self.exp.status = "paused"
        self.exp.save()

        url = "/api/experiments/toggle/"
        res = self.client.post(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.exp.refresh_from_db()
        self.assertEqual(self.exp.status, "active")

    def test_toggle_no_experiment(self):
        self.exp.delete()

        url = "/api/experiments/toggle/"
        res = self.client.post(url)

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    # 🔄 RESTART TESTS

    def test_restart_active_experiment(self):
        url = "/api/experiments/restart/"
        res = self.client.post(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.exp.refresh_from_db()

        self.assertEqual(self.exp.status, "active")
        self.assertIsNone(self.exp.last_checkin_at)

        # check checkins cleared
        self.assertEqual(self.exp.checkins.count(), 0)

    def test_restart_paused_experiment(self):
        self.exp.status = "paused"
        self.exp.save()

        url = "/api/experiments/restart/"
        res = self.client.post(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.exp.refresh_from_db()

        self.assertEqual(self.exp.status, "active")

    def test_restart_no_experiment(self):
        self.exp.delete()

        url = "/api/experiments/restart/"
        res = self.client.post(url)

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_current_returns_only_active(self):
        url = "/api/experiments/current/"

        # active → should return
        res = self.client.get(url)
        self.assertTrue(res.data["data"]["active"])

        # pause → should return inactive
        self.exp.status = "paused"
        self.exp.save()

        res = self.client.get(url)
        self.assertFalse(res.data["data"]["active"])

    def test_full_flow_pause_resume_restart(self):
        toggle_url = "/api/experiments/toggle/"
        restart_url = "/api/experiments/restart/"

        # pause
        self.client.post(toggle_url)
        self.exp.refresh_from_db()
        self.assertEqual(self.exp.status, "paused")

        # resume
        self.client.post(toggle_url)
        self.exp.refresh_from_db()
        self.assertEqual(self.exp.status, "active")

        # restart
        self.client.post(restart_url)
        self.exp.refresh_from_db()
        self.assertEqual(self.exp.status, "active")
        self.assertEqual(self.exp.checkins.count(), 0)
