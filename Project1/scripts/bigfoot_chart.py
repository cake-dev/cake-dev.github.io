import pandas as pd
import plotly.express as px
import plotly
from os.path import join as pjoin
import numpy as np
import plotly.graph_objects as go
from collections import Counter
pd.set_option('display.max_columns', 20)
pd.set_option('display.max_rows', 200)

DATA_LOC = '~/School/Fall2022/Data_Viz/Data'

bf_loc = pjoin(DATA_LOC, 'Sightings/bf_data_1960_2020.csv')
bf_data = pd.read_csv(bf_loc)

bf_per_year = pd.read_csv('bf_per_year.csv')

fig = px.line(bf_per_year, x='Year', y='Count', title='Bigfoot Sightings per year (US 1960-2020)', labels={'Count':'Number of Sightings', 'Year':'Year'})
fig.update_layout(title_font_family='Raleway', title_font_color='black', title_font_size=20, title_x=0.5, title_y=0.95)
fig.add_vline(x=2004, line_dash="dot",
              annotation_text=">50% smart phone sales with camera (2004)", 
              annotation_position="top left", annotation_font_family='Raleway', annotation_font=dict(family="Raleway", size=14, color="#CE5B1B"))
fig.add_shape(type="line",
    x0=1976, y0=42, x1=1976, y1=149,
    line=dict(color="RoyalBlue",width=1, dash="dot")
)
fig.add_shape(type="line",
    x0=1995, y0=50, x1=1995, y1=199,
    line=dict(color="RoyalBlue",width=1, dash="dot")
)
fig.add_shape(type="line",
    x0=1967, y0=13, x1=1967, y1=199,
    line=dict(color="RoyalBlue",width=1, dash="dot")
)
fig.add_annotation(x=1976, y=151,text="Sasquatch, the Legend of Bigfoot released (1976)", showarrow=False, font=dict(family="Raleway", size=12, color="#536D18"))
fig.add_annotation(x=1995, y=201,text="Widespread internet usage takes off", showarrow=False, font=dict(family="Raleway", size=12, color="#536D18"))
fig.add_annotation(x=1967, y=201,text="""<a href="https://www.youtube.com/watch?v=Q60mSMmhTZU">{}</a>""".format("The Patterson/Gimlin Film gains popularity (1967)"), showarrow=False, font=dict(family="Raleway", size=12, color="#536D18"))

fig.data[0].line.color = "#715146"

fig.show()

print(plotly.offline.plot(fig, include_plotlyjs=False, output_type='div'))