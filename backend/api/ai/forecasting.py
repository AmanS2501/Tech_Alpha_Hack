import pandas as pd
from prophet import Prophet
from io import StringIO

def generate_forecast_from_csv(csv_data, periods=7):
    """
    Accepts CSV content and returns forecasted demand for next 'periods' days.
    Expected CSV columns: date, demand
    """
    df = pd.read_csv(StringIO(csv_data))
    df.rename(columns={"date": "ds", "demand": "y"}, inplace=True)
    
    model = Prophet()
    model.fit(df)
    future = model.make_future_dataframe(periods=periods)
    forecast = model.predict(future)

    forecasted = forecast[['ds', 'yhat']].tail(periods)
    forecasted['yhat'] = forecasted['yhat'].apply(lambda x: max(int(x), 0))
    return forecasted.to_dict(orient='records')
