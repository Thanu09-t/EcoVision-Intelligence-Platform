"""
EcoVision AI – Inference Pipeline Orchestrator

This module orchestrates all 5 AI models:
  1. Garbage Detector (YOLOv11)
  2. Waste Segmentor (SAM 2 / U-Net)
  3. Waste Classifier (EfficientNet-B4)
  4. Pollution Severity Estimator
  5. Illegal Dump Detector

In AI_MODE=mock (default), returns realistic synthetic results.
In AI_MODE=real, loads actual model weights and runs inference.

To switch to real inference:
  1. Set AI_MODE=real in your .env
  2. Place weights in ai/*/weights/ directories
  3. Uncomment the INTEGRATION POINT sections below
"""

import asyncio
import random
import time
from typing import Optional
from app.config import settings


# ─── Mock Data Pools ─────────────────────────────────────────────────────────

WASTE_TYPES = ["plastic", "organic", "glass", "metal", "electronic", "biomedical", "construction", "mixed"]
SEVERITY_LEVELS = ["very_low", "low", "medium", "high", "critical"]
ILLEGAL_DUMP_TYPES = ["authorized_yard", "illegal_dump", "temporary_collection", "overflowing_bin", "unknown"]

YOLO_LABELS = [
    "plastic_bag", "plastic_bottle", "cardboard", "glass_bottle",
    "food_waste", "metal_can", "electronic_waste", "construction_debris",
    "mixed_garbage", "overflowing_bin",
]

SEVERITY_WEIGHTS = {
    "very_low": 0.15,
    "low": 0.25,
    "medium": 0.30,
    "high": 0.20,
    "critical": 0.10,
}


def _mock_yolo_detection() -> list:
    """Simulate YOLOv11 bounding box detections."""
    num_objects = random.randint(1, 8)
    detections = []
    for _ in range(num_objects):
        label = random.choice(YOLO_LABELS)
        confidence = round(random.uniform(0.72, 0.99), 2)
        x1 = round(random.uniform(0.0, 0.5), 3)
        y1 = round(random.uniform(0.0, 0.5), 3)
        x2 = round(random.uniform(x1 + 0.1, min(x1 + 0.5, 1.0)), 3)
        y2 = round(random.uniform(y1 + 0.1, min(y1 + 0.5, 1.0)), 3)
        detections.append({"label": label, "confidence": confidence, "bbox": [x1, y1, x2, y2]})
    return sorted(detections, key=lambda x: x["confidence"], reverse=True)


def _mock_waste_classification() -> tuple[str, list]:
    """Simulate EfficientNet-B4 waste classification."""
    primary = random.choices(
        WASTE_TYPES,
        weights=[30, 20, 8, 10, 5, 3, 7, 17],
        k=1,
    )[0]

    # Generate realistic waste type breakdown
    remaining = 100.0
    breakdown = [{"type": primary, "percentage": round(random.uniform(40, 70), 1)}]
    remaining -= breakdown[0]["percentage"]

    others = [t for t in WASTE_TYPES if t != primary]
    random.shuffle(others)
    for i, wt in enumerate(others[:3]):
        if remaining <= 0:
            break
        pct = round(random.uniform(5, min(remaining - 5 * (3 - i - 1), 30)), 1)
        breakdown.append({"type": wt, "percentage": pct})
        remaining -= pct

    if remaining > 0:
        breakdown.append({"type": "mixed", "percentage": round(remaining, 1)})

    return primary, breakdown


def _mock_segmentation() -> tuple[float, float]:
    """Simulate SAM2 / U-Net segmentation output."""
    area_m2 = round(random.uniform(5.0, 500.0), 2)
    coverage_pct = round(random.uniform(10.0, 85.0), 1)
    return area_m2, coverage_pct


def _mock_severity(primary_waste: str, area_m2: float) -> tuple[str, float]:
    """Simulate severity estimation model."""
    base_score = min(area_m2 / 5.0, 80.0)  # larger area = higher score
    waste_multipliers = {
        "biomedical": 1.4, "electronic": 1.3, "construction": 1.1,
        "plastic": 1.0, "metal": 0.9, "glass": 0.9, "organic": 0.8, "mixed": 1.0,
    }
    score = base_score * waste_multipliers.get(primary_waste, 1.0)
    score = max(10.0, min(100.0, score + random.uniform(-10, 10)))
    score = round(score, 1)

    if score >= 85:
        severity = "critical"
    elif score >= 65:
        severity = "high"
    elif score >= 40:
        severity = "medium"
    elif score >= 20:
        severity = "low"
    else:
        severity = "very_low"

    return severity, score


def _mock_illegal_dump(primary_waste: str, area_m2: float) -> tuple[str, bool]:
    """Simulate illegal dump detection."""
    if area_m2 > 200 and primary_waste in ("construction", "electronic", "biomedical"):
        dump_type = "illegal_dump"
        is_illegal = True
    elif area_m2 > 100:
        dump_type = random.choices(
            ["illegal_dump", "temporary_collection", "overflowing_bin"],
            weights=[30, 40, 30],
        )[0]
        is_illegal = dump_type == "illegal_dump"
    else:
        dump_type = random.choices(
            ["overflowing_bin", "temporary_collection", "authorized_yard"],
            weights=[50, 30, 20],
        )[0]
        is_illegal = False

    return dump_type, is_illegal


async def run_inference(image_path: str) -> dict:
    """
    Main inference entry point.
    Routes to mock or real inference based on AI_MODE setting.
    """
    if settings.AI_MODE == "real":
        return await _real_inference(image_path)
    return await _mock_inference(image_path)


async def _mock_inference(image_path: str) -> dict:
    """Realistic mock inference — no GPU required."""
    start = time.time()

    # Simulate processing time
    await asyncio.sleep(random.uniform(0.5, 1.5))

    detected_objects = _mock_yolo_detection()
    primary_waste, waste_types = _mock_waste_classification()
    area_m2, coverage_pct = _mock_segmentation()
    severity, score = _mock_severity(primary_waste, area_m2)
    dump_type, is_illegal = _mock_illegal_dump(primary_waste, area_m2)

    processing_ms = int((time.time() - start) * 1000)

    return {
        "detected_objects": detected_objects,
        "waste_types": waste_types,
        "primary_waste_type": primary_waste,
        "garbage_area_m2": area_m2,
        "coverage_percentage": coverage_pct,
        "severity": severity,
        "pollution_score": score,
        "illegal_dump_type": dump_type,
        "is_illegal": is_illegal,
        "model_version": "mock-v1.0",
        "processing_time_ms": processing_ms,
    }


async def _real_inference(image_path: str) -> dict:
    """
    Real model inference.

    ─── INTEGRATION POINT ────────────────────────────────────────────────────
    Replace mock calls with real model inference below.

    Required packages (install separately):
      pip install torch torchvision ultralytics segment-anything timm

    Steps:
      1. Download YOLOv11 weights: https://github.com/ultralytics/ultralytics
      2. Download SAM2 weights: https://github.com/facebookresearch/segment-anything-2
      3. Train EfficientNet on waste dataset (e.g., TrashNet, TACO)
    ──────────────────────────────────────────────────────────────────────────
    """
    from app.config import settings

    # 1. YOLO Detection
    # from ultralytics import YOLO
    # yolo_model = YOLO(settings.YOLO_WEIGHTS_PATH)
    # yolo_results = yolo_model(image_path)
    # detected_objects = [{"label": r.names[int(b.cls)], "confidence": float(b.conf), "bbox": b.xyxyn[0].tolist()} for b in yolo_results[0].boxes]

    # 2. SAM2 Segmentation
    # from sam2.build_sam import build_sam2
    # sam2 = build_sam2(config_file, settings.SAM_WEIGHTS_PATH, device=settings.DEVICE)
    # area_m2, coverage_pct = run_sam_segmentation(sam2, image_path)

    # 3. EfficientNet Classification
    # import timm, torch
    # classifier = timm.create_model("efficientnet_b4", pretrained=False, num_classes=8)
    # classifier.load_state_dict(torch.load(settings.CLASSIFIER_WEIGHTS_PATH))
    # primary_waste, waste_types = run_classification(classifier, image_path)

    # 4. Severity Estimation
    # severity, score = run_severity_model(area_m2, primary_waste, population_density=None)

    # 5. Illegal Dump Detection
    # dump_type, is_illegal = run_dump_detector(image_path, detected_objects)

    raise NotImplementedError("Real inference not configured. Set AI_MODE=mock in .env or add model weights.")
