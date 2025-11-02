# snhs_architecture.py
# Requires: pip install graphviz

from graphviz import Digraph

dot = Digraph('SNHS_Architecture', format='png')
dot.attr(rankdir='TB', fontsize='14', fontname='Helvetica')

# Styles
actor_style = {'shape': 'rect', 'style': 'rounded,filled', 'fillcolor': '#E6F2FF', 'fontname': 'Helvetica', 'fontsize': '14'}
layer_style = {'shape': 'box3d', 'style': 'filled', 'fillcolor': '#FFF4D9', 'fontname': 'Helvetica', 'fontsize': '14'}
module_style = {'shape': 'folder', 'style': 'filled', 'fillcolor': '#E8F7E4', 'fontname': 'Helvetica', 'fontsize': '18'}
db_style = {'shape': 'cylinder', 'style': 'filled', 'fillcolor': '#F3E6FF', 'fontname': 'Helvetica', 'fontsize': '14'}

# Actors
dot.node('Admin', 'Admin', **actor_style)
dot.node('Adviser', 'Adviser (Teacher)', **actor_style)

# Layers
dot.node('Frontend', 'Frontend (React)\nUser Interface Layer', **layer_style)
dot.node('Backend', 'Backend API (Node.js + Express)\nApplication Layer', **layer_style)
dot.node('Database', 'Database (PostgreSQL)\nData Layer', **db_style)

# Modules (inside backend)
dot.node('Grades', 'Grade Management (SF9)', **module_style)
dot.node('Attendance', 'Attendance Tracking (SF2)', **module_style)
dot.node('Analytics', 'Analytics & KPI Monitoring', **module_style)
dot.node('SY', 'School Year Management', **module_style)
dot.node('Reco', 'Recommendations Engine', **module_style)

# Connections
dot.edge('Admin', 'Frontend', label='Access via Browser')
dot.edge('Adviser', 'Frontend', label='Access via Browser')
dot.edge('Frontend', 'Backend', label='REST API (JSON)')
dot.edge('Backend', 'Database', label='SQL Queries')

# Backend module connections
dot.edge('Backend', 'Grades', style='dashed')
dot.edge('Backend', 'Attendance', style='dashed')
dot.edge('Backend', 'Analytics', style='dashed')
dot.edge('Backend', 'SY', style='dashed')
dot.edge('Backend', 'Reco', style='dashed')

# Data flow between modules and DB
dot.edge('Grades', 'Database', style='dotted')
dot.edge('Attendance', 'Database', style='dotted')
dot.edge('Analytics', 'Database', style='dotted')

# Export
dot.render('2', cleanup=True)
