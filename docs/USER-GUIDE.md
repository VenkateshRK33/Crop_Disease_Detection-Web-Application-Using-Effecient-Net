# KrishiRaksha User Guide

Complete guide to using the KrishiRaksha platform for farmers and agricultural workers.

## Table of Contents

- [Getting Started](#getting-started)
- [Home Page](#home-page)
- [Disease Detection](#disease-detection)
- [Market Prices](#market-prices)
- [Environmental Monitoring](#environmental-monitoring)
- [Harvest Calculator](#harvest-calculator)
- [Crop Calendar](#crop-calendar)
- [Tips and Best Practices](#tips-and-best-practices)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing KrishiRaksha

1. Open your web browser (Chrome, Firefox, Safari, or Edge)
2. Navigate to: `http://localhost:3000` (or your deployed URL)
3. You'll see the KrishiRaksha home page

### Navigation

The navigation bar at the top of every page provides quick access to all features:
- **Home** - Platform overview and quick links
- **Market Prices** - Compare crop prices across markets
- **Disease Detection** - Diagnose plant diseases
- **Environment** - Monitor weather and environmental conditions
- **Harvest Calculator** - Optimize harvest timing
- **Crop Calendar** - Plan farming activities

### Mobile Access

KrishiRaksha works on mobile devices:
- Tap the hamburger menu (☰) to access navigation
- All features are optimized for touch screens
- Use your phone's camera to capture plant images

## Home Page

### Overview

The home page provides:
- Welcome message and platform introduction
- Quick access cards to all major features
- Platform statistics (predictions made, farmers helped, accuracy)
- Benefits of using KrishiRaksha

### Quick Actions

Click on any service card to navigate directly to that feature:
- **Disease Detection** - Start diagnosing plant diseases
- **Market Prices** - Check current crop prices
- **Weather Monitor** - View environmental conditions
- **Harvest Optimizer** - Calculate optimal harvest time

## Disease Detection

### How to Use

1. **Navigate** to Disease Detection page
2. **Upload Image**:
   - Click "Choose File" or drag and drop an image
   - Supported formats: JPG, JPEG, PNG, WEBP
   - Maximum size: 10MB
3. **Wait for Analysis**:
   - Visual pipeline shows progress
   - AI analyzes the image (takes 2-5 seconds)
4. **View Results**:
   - Disease name and confidence score
   - Top 5 predictions
   - Detailed treatment advice from AI chatbot

### Taking Good Photos

For best results:
- **Clear Focus**: Ensure the diseased area is in focus
- **Good Lighting**: Take photos in natural daylight
- **Close-Up**: Get close to the affected area
- **Clean Background**: Avoid cluttered backgrounds
- **Multiple Angles**: Take several photos if unsure

### Understanding Results

**Confidence Score**:
- 90-100%: Very confident diagnosis
- 80-90%: Confident diagnosis
- 70-80%: Likely diagnosis, consider other factors
- Below 70%: Uncertain, consult expert or retake photo

**Top Predictions**:
- Shows top 5 possible diseases
- Helps you understand alternative possibilities
- Compare symptoms with your observations

### AI Chatbot

After diagnosis, the AI chatbot provides:
- **Symptoms**: What to look for
- **Treatment**: Step-by-step remedies
- **Prevention**: How to avoid future infections
- **Timing**: When to apply treatments

**Ask Follow-Up Questions**:
- Type your question in the chat box
- Examples:
  - "How do I apply copper fungicide?"
  - "Can I use organic treatments?"
  - "How long until I see results?"
  - "Is this disease contagious to other plants?"

### Prediction History

- View your past diagnoses
- Click on any prediction to see details
- Track disease patterns over time
- Useful for monitoring recurring issues

## Market Prices

### How to Use

1. **Navigate** to Market Prices page
2. **Select Crop**:
   - Click the dropdown menu
   - Choose your crop (wheat, rice, tomato, etc.)
   - Prices load automatically
3. **View Data**:
   - Price comparison chart
   - Price trend over time
   - Market details table

### Understanding the Data

**Price Comparison Chart**:
- Shows prices across different markets
- Green bar indicates best (lowest) price
- Hover over bars for exact prices

**Price Trend Chart**:
- Shows price changes over last 30 days
- Helps identify price patterns
- Useful for timing your sales

**Market Details Table**:
- **Market**: Market name and location
- **Price**: Current price per quintal
- **Distance**: Distance from your location (km)
- **Last Updated**: When price was last updated

### Making Decisions

**Best Price**:
- Look for the market with lowest price
- Consider distance and transportation costs
- Factor in market fees and commissions

**Price Trends**:
- Rising trend: Prices may continue to increase
- Falling trend: Consider selling soon
- Stable: Good time to sell

**Timing**:
- Compare current price with historical average
- Check if price is above or below normal
- Consider seasonal patterns

## Environmental Monitoring

### How to Use

1. **Navigate** to Environment page
2. **Set Location**:
   - Click "Use Current Location" (requires GPS permission)
   - Or manually enter your location
3. **View Data**:
   - Current weather conditions
   - Environmental metrics
   - 7-day forecast
   - Trend charts
   - Farming recommendations

### Understanding Metrics

**Weather**:
- Current conditions (sunny, cloudy, rainy)
- Temperature in Celsius
- Humidity percentage
- Wind speed

**Air Quality Index (AQI)**:
- 0-50: Good (green)
- 51-100: Moderate (yellow)
- 101-150: Unhealthy for sensitive groups (orange)
- 151+: Unhealthy (red)

**Temperature & Humidity**:
- Optimal for most crops: 20-30°C, 60-80% humidity
- Too hot/dry: Increase irrigation
- Too cold/wet: Risk of fungal diseases

### 7-Day Forecast

- Plan irrigation schedules
- Prepare for extreme weather
- Schedule pesticide applications
- Time harvesting activities

### Farming Recommendations

AI-generated advice based on current conditions:
- "Good conditions for irrigation today"
- "High humidity - monitor for fungal diseases"
- "Low temperature - protect sensitive crops"
- "Strong winds expected - secure structures"

### Using the Data

**Irrigation Planning**:
- Check forecast before watering
- Avoid irrigation before rain
- Increase frequency during hot, dry periods

**Disease Prevention**:
- High humidity + warm temperature = fungal risk
- Apply preventive treatments before conditions worsen

**Harvest Timing**:
- Avoid harvesting before rain
- Choose dry, sunny days
- Check wind conditions for spraying

## Harvest Calculator

### How to Use

1. **Navigate** to Harvest Calculator page
2. **Enter Crop Information**:
   - Select crop type
   - Set current maturity (0-100%)
   - Set pest infestation level (0-100%)
   - Enter current market price (₹/kg)
   - Enter expected yield (kg)
3. **Click "Calculate Optimal Time"**
4. **Review Results**:
   - Optimal harvest date
   - Expected profit
   - Confidence score
   - Scenario comparison
   - Detailed analysis

### Understanding Results

**Optimal Harvest Date**:
- Recommended date to harvest
- Balances maturity and pest damage
- Maximizes profit

**Expected Profit**:
- Estimated profit if you harvest on optimal date
- Based on current market price
- Accounts for pest damage and maturity

**Confidence Score**:
- 80-100%: High confidence
- 60-80%: Moderate confidence
- Below 60%: Low confidence, consider other factors

**Scenario Comparison**:
- **Sell Now**: Immediate profit
- **Wait 7 Days**: Profit after 1 week
- **Optimal**: Best profit scenario
- **Wait 21 Days**: Profit if you wait longer

### Making Decisions

**When to Harvest Early**:
- Pest infestation is severe (>50%)
- Market prices are very high
- Weather forecast shows heavy rain
- Storage capacity is limited

**When to Wait**:
- Crop is still maturing (<70%)
- Pest damage is minimal (<20%)
- Market prices are rising
- Weather conditions are favorable

**Factors to Consider**:
- Storage costs
- Transportation availability
- Market demand
- Alternative crops to plant

## Crop Calendar

### How to Use

1. **Navigate** to Crop Calendar page
2. **View Calendar**:
   - Current month displayed
   - Events shown on dates
   - Color-coded by event type
3. **Add Event**:
   - Click "Add Event" button
   - Fill in event details
   - Click "Save"
4. **Manage Events**:
   - Click event to view details
   - Edit or delete as needed
   - Mark as complete when done

### Event Types

**Planting** (🌱 Green):
- Sowing seeds
- Transplanting seedlings
- Starting new crops

**Irrigation** (💧 Blue):
- Watering schedules
- Drip irrigation maintenance
- Flood irrigation

**Fertilizer** (🌿 Light Green):
- Fertilizer application
- Compost addition
- Nutrient management

**Pesticide** (🛡️ Orange):
- Pesticide spraying
- Organic pest control
- Disease prevention

**Harvest** (🌾 Golden):
- Harvesting dates
- Post-harvest processing
- Storage preparation

### Upcoming Activities

- Shows next 7 days of events
- Sorted by date
- Quick access to mark complete
- Helps you stay organized

### Best Practices

**Planning**:
- Add events at the start of season
- Set reminders for important tasks
- Review calendar weekly

**Tracking**:
- Mark events complete as you do them
- Add notes about results
- Track what works and what doesn't

**Optimization**:
- Use weather data to adjust schedules
- Coordinate with market prices
- Plan around labor availability

## Tips and Best Practices

### Disease Detection

1. **Take Multiple Photos**: Different angles help AI
2. **Early Detection**: Check plants regularly
3. **Act Quickly**: Early treatment is more effective
4. **Keep Records**: Track diseases and treatments
5. **Prevent**: Follow AI prevention advice

### Market Prices

1. **Check Daily**: Prices change frequently
2. **Compare Markets**: Don't settle for first price
3. **Track Trends**: Understand seasonal patterns
4. **Plan Ahead**: Time your harvest for best prices
5. **Consider Costs**: Factor in transportation and fees

### Environmental Monitoring

1. **Check Morning**: Plan your day based on forecast
2. **Monitor Trends**: Watch for pattern changes
3. **Act Proactively**: Prevent problems before they start
4. **Record Data**: Track conditions over time
5. **Adjust Plans**: Be flexible based on weather

### Harvest Calculator

1. **Update Regularly**: Recalculate as conditions change
2. **Be Realistic**: Use accurate maturity and pest data
3. **Consider All Factors**: Don't rely solely on calculator
4. **Track Results**: Compare predictions with actual outcomes
5. **Learn**: Improve your estimates over time

### Crop Calendar

1. **Plan Ahead**: Add events for entire season
2. **Set Reminders**: Don't miss important tasks
3. **Be Flexible**: Adjust based on weather and conditions
4. **Review Regularly**: Check calendar daily
5. **Learn from History**: Review past seasons

## Troubleshooting

### Common Issues

**Image Upload Fails**:
- Check file size (max 10MB)
- Ensure file format is supported (JPG, PNG, WEBP)
- Try a different image
- Check internet connection

**Slow Loading**:
- Check internet connection
- Refresh the page
- Clear browser cache
- Try a different browser

**Incorrect Disease Detection**:
- Retake photo with better lighting
- Get closer to affected area
- Try multiple photos
- Consult with agricultural expert

**Market Prices Not Loading**:
- Check internet connection
- Refresh the page
- Try a different crop
- Contact support if persistent

**Weather Data Unavailable**:
- Check location permissions
- Verify GPS is enabled
- Try manual location entry
- Check internet connection

**Calculator Gives Unexpected Results**:
- Verify input values are correct
- Check maturity and pest percentages
- Ensure market price is accurate
- Consider recalculating with adjusted values

### Getting Help

**In-App Support**:
- Check footer for contact information
- Use help center links
- Review documentation

**Technical Issues**:
- Clear browser cache
- Update browser to latest version
- Try different device
- Contact technical support

**Agricultural Questions**:
- Consult local agricultural extension office
- Contact agricultural experts
- Join farmer communities
- Attend training sessions

## Accessibility Features

KrishiRaksha is designed to be accessible:
- **Keyboard Navigation**: Use Tab and Enter keys
- **Screen Reader Support**: Compatible with screen readers
- **High Contrast**: Good color contrast for visibility
- **Mobile Friendly**: Works on all devices
- **Bilingual**: English and Hindi support

## Privacy and Data

- Your data is stored securely
- Predictions are saved for your reference
- No personal information is shared
- You can delete your data anytime

## Feedback

We value your feedback:
- Report bugs or issues
- Suggest new features
- Share success stories
- Help us improve

Contact: support@krishiraksha.in

---

**Happy Farming with KrishiRaksha!** 🌾

*Empowering Farmers with Smart Agriculture*
