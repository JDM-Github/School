# snhs_dfd.py
# High-resolution vertical DFD for Senior National High School Management System
# Requires: pip install graphviz

from graphviz import Digraph

dot = Digraph('SNHS_DFD', format='png')
dot.attr(rankdir='TB', fontsize='32')  # Vertical layout (Top to Bottom)
dot.attr(dpi='480')  # Increase resolution (sharp output)

# Styles with larger fonts
actor_style = {
    'shape': 'rect', 'style': 'rounded,filled',
    'fillcolor': '#E6F2FF', 'fontname': 'Helvetica-Bold', 'fontsize': '32'
}
system_style = {
    'shape': 'component', 'style': 'filled',
    'fillcolor': '#FFF4D9', 'fontname': 'Helvetica-Bold', 'fontsize': '32'
}
module_style = {
    'shape': 'oval', 'style': 'filled',
    'fillcolor': '#E8F7E4', 'fontname': 'Helvetica-Bold', 'fontsize': '32'
}
db_style = {
    'shape': 'cylinder', 'style': 'filled',
    'fillcolor': '#F3E6FF', 'fontname': 'Helvetica-Bold', 'fontsize': '32'
}
note_style = {'shape': 'note', 'fontsize': '22', 'fontname': 'Helvetica-Bold'}


# Actors
dot.node('Admin', 'Admin', **actor_style)
dot.node('Adviser', 'Adviser (Teacher)', **actor_style)
dot.node('StudentActor', 'Student (Data Subject)', **actor_style)

# Frontend & Backend
dot.node('Frontend', 'Frontend (React)\nAdmin & Adviser UIs', **system_style)
dot.node('Backend', 'Backend API\nNode.js + Express', **system_style)

# Database
dot.node('Postgres', 'PostgreSQL\nStudent / Adviser / Grades / Attendance / SF2/SF9 / KPI', **db_style)

# Core Modules
dot.node('SY', 'School Year Management', **module_style)
dot.node('Students', 'Student Management', **module_style)
dot.node('Advisers', 'Adviser Management', **module_style)
dot.node('Subjects', 'Subject Management', **module_style)
dot.node('Grades', 'Grade Management (SF9)', **module_style)
dot.node('Attendance', 'Attendance Tracking (SF2)', **module_style)
dot.node('Analytics', 'Analytics & KPIs', **module_style)
dot.node('Reco', 'Recommendations Engine', **module_style)
dot.node('Reports', 'Reports / Exports', **module_style)


# Edges
dot.edge_attr.update({'fontname': 'Helvetica-Bold'})
dot.edge('Frontend', 'Backend', label='REST API (JSON)', fontsize='28')
dot.edge('Backend', 'Postgres', label='SQL Queries / CRUD', fontsize='28')

dot.edge('Admin', 'Frontend', label='Login, Manage, View Analytics', fontsize='28')
dot.edge('Adviser', 'Frontend', label='Login, Edit Grades/Attendance', fontsize='28')
dot.edge('StudentActor', 'Frontend', label='(data subject)', style='dashed', fontsize='32')

dot.edge('Frontend', 'Students', label='Create / Update / View Students', fontsize='32', style='dashed')
dot.edge('Frontend', 'Advisers', label='Create / Update / View Advisers', fontsize='32', style='dashed')
dot.edge('Frontend', 'Subjects', label='View / Assign Subjects', fontsize='32', style='dashed')
dot.edge('Frontend', 'SY', label='Create / Switch School Year', fontsize='32', style='dashed')

dot.edge('Backend', 'Students', label='manages', fontsize='32')
dot.edge('Backend', 'Advisers', label='manages', fontsize='32')
dot.edge('Backend', 'Subjects', label='manages', fontsize='32')
dot.edge('Backend', 'SY', label='manages', fontsize='32')

dot.edge('Frontend', 'Grades', label='Upload / Input Grades (SF9)', fontsize='32')
dot.edge('Frontend', 'Attendance', label='Upload / Input Attendance (SF2)', fontsize='32')
dot.edge('Grades', 'Backend', label='submit grades', fontsize='32', arrowhead='none', style='dotted')
dot.edge('Attendance', 'Backend', label='submit attendance', fontsize='32', arrowhead='none', style='dotted')

dot.edge('Students', 'Postgres', label='students table', fontsize='32')
dot.edge('Advisers', 'Postgres', label='advisers table', fontsize='32')
dot.edge('Subjects', 'Postgres', label='subjects table', fontsize='32')
dot.edge('Grades', 'Postgres', label='grades table (SF9)', fontsize='32')
dot.edge('Attendance', 'Postgres', label='attendance table (SF2)', fontsize='32')

dot.edge('Backend', 'Analytics', label='aggregate KPIs', fontsize='32')
dot.edge('Analytics', 'Postgres', label='read aggregated data', fontsize='32')
dot.edge('Reco', 'Analytics', label='feed insights', fontsize='32')
dot.edge('Backend', 'Reco', label='invoke recommendations', fontsize='32')

dot.edge('Analytics', 'Reports', label='generate charts/reports', fontsize='32')
dot.edge('Reports', 'Frontend', label='view', fontsize='32')

dot.edge('Attendance', 'Analytics', label='SF2 encoding status', fontsize='32', color='#8B0000')
dot.edge('Grades', 'Analytics', label='SF9 completion status', fontsize='32', color='#8B0000')

# Layout & Spacing adjustments
dot.attr(
    'graph',
    ranksep='4.4',  # Vertical spacing between layers
    nodesep='0.2',  # Slightly reduced horizontal spacing
    size='6,20!',   # More height (taller)
    splines='true',
    pad='0.8'
)
dot.attr('node', margin='0.35')

# Render output
output_png = 'snhs_dfd_highres.png'
dot.render(filename='1', cleanup=True)

print(f"High-resolution DFD rendered as {output_png}")
