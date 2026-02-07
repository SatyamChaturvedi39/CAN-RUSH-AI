from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import math

app = Flask(__name__)
CORS(app)

# Vendor capacity configurations
VENDOR_CAPACITY = {
    'default': {
        'capacity': 15,
        'avg_prep_time': 12
    }
}

# Peak hour definitions
PEAK_HOURS = [[11, 12, 13], [16, 17, 18]]  # Lunch and evening snack times

def calculate_load_factor(queue_length, capacity=15):
    """
    Calculate load factor based on current queue length
    Returns multiplier between 1.0 and 3.0
    """
    if queue_length == 0:
        return 1.0
    
    utilization = queue_length / capacity
    
    if utilization <= 0.3:  # Low load
        return 1.0
    elif utilization <= 0.6:  # Medium load
        return 1.2 + (utilization - 0.3) * 0.5
    elif utilization <= 0.9:  # High load
        return 1.35 + (utilization - 0.6) * 1.0
    else:  # Overloaded
        return 1.65 + (utilization - 0.9) * 2.0

def calculate_peak_factor(current_hour):
    """
    Calculate peak hour multiplier
    Returns 1.0 for normal hours, 1.5-2.0 for peak hours
    """
    for peak_range in PEAK_HOURS:
        if current_hour in peak_range:
            # Middle of peak gets highest multiplier
            middle = peak_range[len(peak_range) // 2]
            distance_from_middle = abs(current_hour - middle)
            return 1.5 + (0.5 * (1 - distance_from_middle / 2))
    
    return 1.0

def calculate_complexity_factor(order_items):
    """
    Calculate order complexity based on item variety and quantity
    More items = slightly longer prep time due to coordination
    """
    total_items = sum(item['quantity'] for item in order_items)
    unique_items = len(order_items)
    
    # Base complexity
    complexity = 1.0
    
    # Add factor for total quantity
    if total_items > 5:
        complexity += 0.1
    if total_items > 10:
        complexity += 0.15
    
    # Add factor for variety (different items need different stations)
    if unique_items > 3:
        complexity += 0.1
    if unique_items > 5:
        complexity += 0.15
    
    return min(complexity, 1.5)  # Cap at 1.5x

@app.route('/predict', methods=['POST'])
def predict_queue_time():
    """
    Main prediction endpoint
    
    Expected input:
    {
        "vendor_id": "string",
        "order_items": [
            {
                "food_item_id": "string",
                "quantity": int,
                "base_prep_time": int
            }
        ],
        "requested_pickup_time": "ISO datetime",
        "current_time": "ISO datetime",
        "current_queue_length": int
    }
    
    Returns:
    {
        "predicted_ready_time": "ISO datetime",
        "estimated_wait_minutes": float,
        "confidence": float,
        "queue_position": int,
        "factors": {
            "base_time": float,
            "load_factor": float,
            "peak_factor": float,
            "complexity_factor": float
        }
    }
    """
    try:
        data = request.json
        
        # Extract data
        order_items = data.get('order_items', [])
        current_time = datetime.fromisoformat(data.get('current_time', datetime.now().isoformat()).replace('Z', '+00:00'))
        queue_length = data.get('current_queue_length', 0)
        
        # 1. Calculate base preparation time
        base_time = sum(
            item['base_prep_time'] * item['quantity']
            for item in order_items
        )
        
        # If multiple items, average them intelligently (parallel prep)
        if len(order_items) > 1:
            # Items can be prepared somewhat in parallel
            parallel_efficiency = 0.7  # 70% efficiency in parallel
            base_time = base_time * parallel_efficiency
        
        # 2. Calculate load factor
        load_factor = calculate_load_factor(queue_length)
        
        # 3. Calculate peak hour factor
        current_hour = current_time.hour
        peak_factor = calculate_peak_factor(current_hour)
        
        # 4. Calculate complexity factor
        complexity_factor = calculate_complexity_factor(order_items)
        
        # 5. Calculate final prediction
        estimated_minutes = base_time * load_factor * peak_factor * complexity_factor
        
        # Add minimum buffer time (vendor needs time to see and accept order)
        estimated_minutes += 2  # 2-minute minimum buffer
        
        # Round to nearest 0.5 minutes
        estimated_minutes = round(estimated_minutes * 2) / 2
        
        # Calculate ready time
        predicted_ready_time = current_time + timedelta(minutes=estimated_minutes)
        
        # Calculate confidence (higher confidence when less loaded)
        if queue_length == 0:
            confidence = 0.95
        elif queue_length <= 5:
            confidence = 0.90
        elif queue_length <= 10:
            confidence = 0.85
        elif queue_length <= 15:
            confidence = 0.75
        else:
            confidence = 0.65
        
        # Return prediction
        response = {
            "predicted_ready_time": predicted_ready_time.isoformat(),
            "estimated_wait_minutes": estimated_minutes,
            "confidence": confidence,
            "queue_position": queue_length + 1,
            "factors": {
                "base_time": base_time,
                "load_factor": load_factor,
                "peak_factor": peak_factor,
                "complexity_factor": complexity_factor
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "message": "Prediction failed"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Canteen Rush ML Prediction Service",
        "version": "1.0.0"
    }), 200

@app.route('/feedback', methods=['POST'])
def record_feedback():
    """
    Record actual vs predicted time for model improvement
    
    Expected input:
    {
        "order_id": "string",
        "predicted_time": float,
        "actual_time": float,
        "vendor_id": "string"
    }
    """
    try:
        data = request.json
        
        # In a production system, this would:
        # 1. Store feedback in database
        # 2. Trigger periodic model retraining
        # 3. Update prediction parameters
        
        # For now, just acknowledge
        return jsonify({
            "success": True,
            "message": "Feedback recorded successfully"
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "message": "Failed to record feedback"
        }), 500

@app.route('/model/stats', methods=['GET'])
def get_model_stats():
    """Get model performance statistics"""
    # Mock stats for now
    return jsonify({
        "accuracy": 0.85,
        "mean_absolute_error": 2.3,  # minutes
        "predictions_made": 1250,
        "feedback_received": 890,
        "last_updated": datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    # Run on port 8000
    app.run(host='0.0.0.0', port=8000, debug=True)
