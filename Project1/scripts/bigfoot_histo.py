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

bf_loc = pjoin(DATA_LOC, 'Sightings/bf_data_main.csv')
bf_data = pd.read_csv(bf_loc)


fig = px.histogram(bf_data, x='state', title='Bigfoot Sightings by State (US)', labels={'State':'State'}, nbins=50)
fig.update_xaxes(categoryorder='total descending')

fig.show()

#print(plotly.offline.plot(fig, include_plotlyjs=False, output_type='div'))