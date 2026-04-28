# Installing as a systemd service

```bash
sudo cp deploy/pi-dashboard.service /etc/systemd/system/pi-dashboard.service
sudo systemctl daemon-reload
sudo systemctl enable --now pi-dashboard.service
sudo systemctl status pi-dashboard.service
```

The service runs as user `ewitz` from `/home/ewitz/projects/pi-dashboard`. Adjust `User=`, `Group=`, `WorkingDirectory=`, and `ReadWritePaths=` in the unit file if your setup differs.

Logs:

```bash
journalctl -u pi-dashboard -f
```
