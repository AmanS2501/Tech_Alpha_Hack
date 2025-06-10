import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

class MedicineDistributionAI:
    def __init__(self):
        self.demand_model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.shortage_model = LinearRegression()
        self.scaler = StandardScaler()
        self.locations = {}
        self.redistribution_history = []
        
    def load_sample_data(self):
        """Generate sample data for demonstration"""
        np.random.seed(42)
        
        # Sample locations with medicine inventory
        self.locations = {
            'City_Hospital': {
                'current_stock': 150,
                'daily_consumption': [20, 25, 22, 28, 24, 26, 23],  # Last 7 days
                'threshold': 100,
                'type': 'hospital',
                'population_served': 50000
            },
            'Central_Pharmacy': {
                'current_stock': 80,
                'daily_consumption': [15, 18, 16, 14, 17, 19, 16],
                'threshold': 50,
                'type': 'pharmacy',
                'population_served': 20000
            },
            'Rural_Clinic': {
                'current_stock': 25,
                'daily_consumption': [8, 12, 10, 9, 11, 13, 10],
                'threshold': 40,
                'type': 'clinic',
                'population_served': 5000
            },
            'District_Hospital': {
                'current_stock': 200,
                'daily_consumption': [30, 35, 32, 38, 34, 36, 33],
                'threshold': 120,
                'type': 'hospital',
                'population_served': 80000
            }
        }
        
        # Generate historical data for training
        self.generate_historical_data()
        
    def generate_historical_data(self):
        """Generate synthetic historical data for model training"""
        dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='D')
        self.historical_data = []
        
        for location, data in self.locations.items():
            for date in dates:
                # Simulate seasonal patterns and random variations
                base_demand = np.mean(data['daily_consumption'])
                seasonal_factor = 1 + 0.3 * np.sin(2 * np.pi * date.dayofyear / 365)
                weekend_factor = 0.7 if date.weekday() >= 5 else 1.0
                random_factor = np.random.normal(1, 0.2)
                
                predicted_demand = base_demand * seasonal_factor * weekend_factor * random_factor
                predicted_demand = max(1, predicted_demand)  # Ensure positive demand
                
                self.historical_data.append({
                    'location': location,
                    'date': date,
                    'day_of_week': date.weekday(),
                    'day_of_year': date.dayofyear,
                    'population_served': data['population_served'],
                    'location_type': data['type'],
                    'actual_demand': predicted_demand
                })
        
        self.historical_df = pd.DataFrame(self.historical_data)
        
    def train_demand_prediction_model(self):
        """Train LSTM-like model using Random Forest for demand prediction"""
        print("Training demand prediction model...")
        
        # Prepare features
        features = []
        targets = []
        
        for location in self.locations.keys():
            location_data = self.historical_df[self.historical_df['location'] == location].copy()
            location_data = location_data.sort_values('date')
            
            # Create time series features (sliding window)
            window_size = 7
            for i in range(window_size, len(location_data)):
                # Last 7 days of demand as features
                past_demands = location_data['actual_demand'].iloc[i-window_size:i].values
                current_features = [
                    *past_demands,
                    location_data['day_of_week'].iloc[i],
                    location_data['day_of_year'].iloc[i],
                    location_data['population_served'].iloc[i],
                    1 if location_data['location_type'].iloc[i] == 'hospital' else 0,
                    1 if location_data['location_type'].iloc[i] == 'pharmacy' else 0,
                ]
                
                features.append(current_features)
                targets.append(location_data['actual_demand'].iloc[i])
        
        X = np.array(features)
        y = np.array(targets)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.demand_model.fit(X_scaled, y)
        
        print(f"Model trained with {len(X)} samples")
        print(f"Model score: {self.demand_model.score(X_scaled, y):.3f}")
        
    def predict_demand(self, location, days_ahead=7):
        """Predict demand for next N days"""
        if location not in self.locations:
            return None
            
        # Use recent consumption data as features
        recent_demand = self.locations[location]['daily_consumption']
        
        predictions = []
        current_demand = recent_demand.copy()
        
        for day in range(days_ahead):
            # Prepare features similar to training
            features = [
                *current_demand[-7:],  # Last 7 days
                day % 7,  # Day of week
                (day + 180) % 365,  # Approximate day of year
                self.locations[location]['population_served'],
                1 if self.locations[location]['type'] == 'hospital' else 0,
                1 if self.locations[location]['type'] == 'pharmacy' else 0,
            ]
            
            # Ensure we have exactly the right number of features
            if len(features) < 12:
                features.extend([0] * (12 - len(features)))
            
            X_pred = np.array(features).reshape(1, -1)
            X_pred_scaled = self.scaler.transform(X_pred)
            
            predicted_demand = self.demand_model.predict(X_pred_scaled)[0]
            predicted_demand = max(1, predicted_demand)  # Ensure positive
            
            predictions.append(predicted_demand)
            current_demand.append(predicted_demand)
            
        return predictions
    
    def detect_shortage_risk(self):
        """Detect locations at risk of shortage"""
        risks = {}
        
        for location, data in self.locations.items():
            current_stock = data['current_stock']
            threshold = data['threshold']
            
            # Predict next 7 days demand
            predicted_demands = self.predict_demand(location, days_ahead=7)
            
            if predicted_demands:
                total_predicted_demand = sum(predicted_demands)
                avg_daily_demand = np.mean(predicted_demands)
                days_until_shortage = current_stock / avg_daily_demand if avg_daily_demand > 0 else float('inf')
                
                risk_score = 0
                if current_stock < threshold:
                    risk_score += 50
                if days_until_shortage < 7:
                    risk_score += 30
                if total_predicted_demand > current_stock:
                    risk_score += 20
                
                risks[location] = {
                    'risk_score': min(risk_score, 100),
                    'current_stock': current_stock,
                    'predicted_7day_demand': total_predicted_demand,
                    'days_until_shortage': days_until_shortage,
                    'status': 'CRITICAL' if risk_score > 70 else 'WARNING' if risk_score > 40 else 'SAFE'
                }
        
        return risks
    
    def optimize_redistribution(self):
        """AI-driven redistribution optimization"""
        risks = self.detect_shortage_risk()
        
        # Identify surplus and deficit locations
        surplus_locations = []
        deficit_locations = []
        
        for location, risk_data in risks.items():
            current_stock = risk_data['current_stock']
            threshold = self.locations[location]['threshold']
            
            if current_stock > threshold * 1.5:  # Surplus
                surplus_amount = current_stock - threshold
                surplus_locations.append({
                    'location': location,
                    'surplus': surplus_amount,
                    'priority': 1 / (risk_data['risk_score'] + 1)  # Lower risk = higher surplus priority
                })
            elif risk_data['status'] in ['CRITICAL', 'WARNING']:  # Deficit
                needed_amount = threshold - current_stock
                deficit_locations.append({
                    'location': location,
                    'needed': max(needed_amount, 0),
                    'priority': risk_data['risk_score'],  # Higher risk = higher priority
                    'urgency': risk_data['status']
                })
        
        # Sort by priority
        surplus_locations.sort(key=lambda x: x['priority'], reverse=True)
        deficit_locations.sort(key=lambda x: x['priority'], reverse=True)
        
        # Generate redistribution recommendations
        redistributions = []
        
        for deficit in deficit_locations:
            remaining_need = deficit['needed']
            
            for surplus in surplus_locations:
                if remaining_need <= 0:
                    break
                    
                if surplus['surplus'] > 0:
                    transfer_amount = min(remaining_need, surplus['surplus'])
                    
                    redistributions.append({
                        'from': surplus['location'],
                        'to': deficit['location'],
                        'amount': transfer_amount,
                        'urgency': deficit['urgency'],
                        'reason': f"Prevent shortage at {deficit['location']}"
                    })
                    
                    # Update tracking
                    surplus['surplus'] -= transfer_amount
                    remaining_need -= transfer_amount
        
        return redistributions
    
    def simulate_real_time_update(self):
        """Simulate real-time stock updates"""
        print("\n=== REAL-TIME SIMULATION ===")
        
        for location in self.locations:
            # Simulate consumption
            consumption = np.random.normal(
                np.mean(self.locations[location]['daily_consumption']), 
                2
            )
            consumption = max(0, consumption)
            
            # Update stock
            self.locations[location]['current_stock'] -= int(consumption)
            self.locations[location]['current_stock'] = max(0, self.locations[location]['current_stock'])
            
            print(f"{location}: Consumed {int(consumption)} units, Stock: {self.locations[location]['current_stock']}")
    
    def generate_report(self):
        """Generate comprehensive AI analysis report"""
        print("\n" + "="*60)
        print("         MEDICINE DISTRIBUTION AI REPORT")
        print("="*60)
        
        # Current status
        print("\n📊 CURRENT INVENTORY STATUS:")
        for location, data in self.locations.items():
            status = "🔴 CRITICAL" if data['current_stock'] < data['threshold'] * 0.5 else \
                    "🟡 LOW" if data['current_stock'] < data['threshold'] else \
                    "🟢 NORMAL"
            print(f"  {location}: {data['current_stock']} units {status}")
        
        # Demand predictions
        print("\n🔮 AI DEMAND PREDICTIONS (Next 7 days):")
        for location in self.locations:
            predictions = self.predict_demand(location)
            if predictions:
                avg_demand = np.mean(predictions)
                print(f"  {location}: {avg_demand:.1f} units/day average")
        
        # Risk analysis
        print("\n⚠️  SHORTAGE RISK ANALYSIS:")
        risks = self.detect_shortage_risk()
        for location, risk in risks.items():
            print(f"  {location}: {risk['status']} (Risk Score: {risk['risk_score']}/100)")
            print(f"    Days until shortage: {risk['days_until_shortage']:.1f}")
        
        # Redistribution recommendations
        print("\n🚚 AI REDISTRIBUTION RECOMMENDATIONS:")
        redistributions = self.optimize_redistribution()
        if redistributions:
            for i, redist in enumerate(redistributions, 1):
                print(f"  {i}. Transfer {redist['amount']} units")
                print(f"     From: {redist['from']} → To: {redist['to']}")
                print(f"     Urgency: {redist['urgency']}")
        else:
            print("  No redistributions needed at this time.")
        
        return redistributions


def main():
    """Main execution function for hackathon demo"""
    print("🏥 MEDICINE DISTRIBUTION AI SYSTEM")
    print("=" * 50)
    
    # Initialize AI system
    ai_system = MedicineDistributionAI()
    
    # Load and prepare data
    print("📊 Loading sample data...")
    ai_system.load_sample_data()
    
    # Train AI models
    print("🤖 Training AI models...")
    ai_system.train_demand_prediction_model()
    
    # Generate initial report
    print("📋 Generating initial analysis...")
    redistributions = ai_system.generate_report()
    
    # Simulate real-time updates
    print("\n🔄 Simulating real-time updates...")
    for cycle in range(3):
        print(f"\n--- Update Cycle {cycle + 1} ---")
        ai_system.simulate_real_time_update()
        
        # Quick risk check
        risks = ai_system.detect_shortage_risk()
        critical_locations = [loc for loc, risk in risks.items() if risk['status'] == 'CRITICAL']
        
        if critical_locations:
            print(f"🚨 ALERT: Critical shortage detected at: {', '.join(critical_locations)}")
            new_redistributions = ai_system.optimize_redistribution()
            if new_redistributions:
                print("🤖 AI recommends immediate redistribution:")
                for redist in new_redistributions[:2]:  # Show top 2
                    print(f"  • {redist['amount']} units: {redist['from']} → {redist['to']}")
    
    print("\n✅ AI System Demo Complete!")
    print("💡 Key Features Demonstrated:")
    print("  • Demand prediction using Random Forest")
    print("  • Real-time shortage risk assessment")
    print("  • Automated redistribution optimization")
    print("  • Continuous monitoring and alerts")


if __name__ == "__main__":
    main()