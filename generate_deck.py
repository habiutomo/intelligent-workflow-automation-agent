from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import Flowable
import os

# Colors
PRIMARY = HexColor("#0f172a")
SECONDARY = HexColor("#1e293b")
ACCENT = HexColor("#3b82f6")
ACCENT_LIGHT = HexColor("#60a5fa")
SUCCESS = HexColor("#22c55e")
WARNING = HexColor("#f59e0b")
DANGER = HexColor("#ef4444")
INFO = HexColor("#06b6d4")
TEXT_PRIMARY = HexColor("#f8fafc")
TEXT_SECONDARY = HexColor("#94a3b8")
BG_DARK = HexColor("#0f172a")
BG_CARD = HexColor("#1e293b")

WIDTH, HEIGHT = A4

def draw_bg(canvas, doc):
    canvas.setFillColor(BG_DARK)
    canvas.rect(0, 0, WIDTH, HEIGHT, fill=1)

def draw_gradient_bar(canvas, x, y, width, height=3, color=ACCENT):
    canvas.setFillColor(color)
    canvas.roundRect(x, y, width, height, 2, fill=1)

def create_presentation():
    output_path = "intelligent-workflow-automation-agent-deck.pdf"
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=32, textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=6)
    subtitle_style = ParagraphStyle('CustomSubtitle', parent=styles['Normal'], fontName='Helvetica', fontSize=16, textColor=TEXT_SECONDARY, alignment=TA_LEFT, spaceAfter=20)
    heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=24, textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=8)
    body_style = ParagraphStyle('CustomBody', parent=styles['Normal'], fontName='Helvetica', fontSize=11, textColor=TEXT_SECONDARY, alignment=TA_LEFT, spaceAfter=8, leading=16)
    small_style = ParagraphStyle('SmallStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=9, textColor=TEXT_SECONDARY, alignment=TA_LEFT, spaceAfter=4)
    center_style = ParagraphStyle('CenterStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=14, textColor=TEXT_SECONDARY, alignment=TA_CENTER, spaceAfter=10)

    def bar_line(text, color=ACCENT):
        return Paragraph(f"<font color='#{color.hexval()[2:]}'>{text}</font>", ParagraphStyle('BarLine', parent=body_style, fontSize=11, spaceAfter=6, leftIndent=10))

    elements = []

    # ===== SLIDE 1: TITLE =====
    elements.append(Spacer(1, 140))
    elements.append(Paragraph("<font color='#3b82f6' size='16'>####</font>", body_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("Intelligent Workflow<br/>Automation Agent", title_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("Production-ready workflow automation platform<br/>with visual editor, AI-powered steps, and multi-trigger support", subtitle_style))
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("<font color='#3b82f6'>________________</font>", body_style))
    elements.append(Spacer(1, 20))
    tech_style = ParagraphStyle('TechText', parent=body_style, fontSize=10, textColor=ACCENT_LIGHT)
    elements.append(Paragraph("TypeScript  |  React  |  Express  |  Prisma  |  Vite", tech_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("v1.0.0  |  2026", small_style))
    elements.append(PageBreak())

    # ===== SLIDE 2: PROBLEM STATEMENT =====
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("The Problem", heading_style))
    elements.append(Paragraph("<font color='#3b82f6'>________</font>", body_style))
    elements.append(Spacer(1, 25))

    problems = [
        ("<font color='#ef4444'>!</font>  <b>Manual Processes</b>", "      Repetitive tasks consume valuable engineering time"),
        ("<font color='#ef4444'>!</font>  <b>No Visibility</b>", "      Hard to track workflow execution and failures"),
        ("<font color='#ef4444'>!</font>  <b>Scattered Tools</b>", "      Multiple disconnected tools for different automation needs"),
        ("<font color='#ef4444'>!</font>  <b>No Code Execution</b>", "      Lack of safe, sandboxed code execution in workflows"),
    ]

    for title, desc in problems:
        elements.append(Paragraph(title, ParagraphStyle('PT', parent=body_style, fontSize=13, textColor=TEXT_PRIMARY, spaceAfter=3)))
        elements.append(Paragraph(desc, ParagraphStyle('PD', parent=body_style, fontSize=10, spaceAfter=15)))

    elements.append(Spacer(1, 20))
    elements.append(Paragraph("<b>Goal:</b> Build a unified, intelligent workflow automation platform that empowers teams to design, execute, and monitor complex workflows with ease.", body_style))
    elements.append(PageBreak())

    # ===== SLIDE 3: SOLUTION OVERVIEW =====
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("Our Solution", heading_style))
    elements.append(Paragraph("<font color='#3b82f6'>________</font>", body_style))
    elements.append(Spacer(1, 25))
    elements.append(Paragraph("A full-stack workflow automation platform with:", body_style))
    elements.append(Spacer(1, 10))

    for sol in [
        "Visual drag-and-drop workflow editor (React Flow)",
        "Multiple node types: AI, HTTP, Code, Condition, Email, etc.",
        "Multi-trigger support: Manual, Schedule (Cron), Webhook, Event",
        "Real-time execution monitoring via WebSocket",
        "Production-ready with Prisma ORM, BullMQ, and Redis",
        "Role-based audit logging for compliance",
    ]:
        elements.append(Paragraph(f"<font color='#22c55e'>+</font>  {sol}", ParagraphStyle('SL', parent=body_style, fontSize=11, spaceAfter=8, leftIndent=10)))

    elements.append(PageBreak())

    # ===== SLIDE 4: ARCHITECTURE =====
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("Architecture", heading_style))
    elements.append(Paragraph("<font color='#3b82f6'>________</font>", body_style))
    elements.append(Spacer(1, 20))

    arch_data = [
        ["FRONTEND", "", "BACKEND", "", "INFRASTRUCTURE"],
        ["React 18", "", "Express.js", "", "SQLite / PostgreSQL"],
        ["Vite", "", "TypeScript", "", "Redis (BullMQ)"],
        ["React Flow", "", "Prisma ORM", "", "WebSocket"],
        ["React Router", "", "Socket.IO", "", "Cron Scheduler"],
    ]
    arch_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT), ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (1, -1), BG_CARD), ('BACKGROUND', (2, 1), (3, -1), BG_CARD),
        ('BACKGROUND', (4, 1), (4, -1), BG_CARD),
        ('TEXTCOLOR', (0, 1), (-1, -1), TEXT_SECONDARY), ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, HexColor("#334155")),
        ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ])
    elements.append(Table(arch_data, colWidths=[100, 20, 100, 20, 100]).__class__(arch_data, colWidths=[100, 20, 100, 20, 100]))
    t = Table(arch_data, colWidths=[100, 20, 100, 20, 100])
    t.setStyle(arch_style)
    elements.append(t)
    elements.append(Spacer(1, 25))

    elements.append(Paragraph("<b>Data Flow:</b>", ParagraphStyle('FT', parent=body_style, fontSize=12, textColor=TEXT_PRIMARY, spaceAfter=8)))
    for step in [
        "1. User designs workflow in Visual Editor (React Flow)",
        "2. Workflow saved to database via REST API",
        "3. Trigger activated (Manual / Schedule / Webhook / Event)",
        "4. Workflow Engine executes nodes sequentially",
        "5. Real-time status updates via WebSocket",
        "6. Results stored, audit log updated",
    ]:
        elements.append(Paragraph(step, ParagraphStyle('FS', parent=body_style, fontSize=10, spaceAfter=5, leftIndent=10)))

    elements.append(PageBreak())

    # ===== SLIDE 5: KEY FEATURES =====
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("Key Features", heading_style))
    elements.append(Paragraph("<font color='#3b82f6'>________</font>", body_style))
    elements.append(Spacer(1, 20))

    features = [
        ("Visual Editor", "Drag-and-drop workflow design with React Flow canvas", ACCENT),
        ("AI Integration", "OpenAI/Anthropic powered intelligent workflow steps", INFO),
        ("Multi-Trigger", "Manual, Cron schedule, Webhook, and Event-based triggers", SUCCESS),
        ("Code Execution", "Sandboxed JavaScript/Python code execution in workflows", WARNING),
        ("Real-time", "Live execution monitoring via WebSocket connections", HexColor("#a78bfa")),
        ("Audit Trail", "Complete execution history with compliance logging", DANGER),
    ]

    for title, desc, color in features:
        feat_data = [[
            Paragraph(f"<font color='#{color.hexval()[2:]}'>  {title}</font>", ParagraphStyle('CT', parent=body_style, fontSize=12, textColor=color, spaceAfter=3)),
            Paragraph(desc, ParagraphStyle('CD', parent=body_style, fontSize=9, textColor=TEXT_SECONDARY))
        ]]
        feat_table = Table(feat_data, colWidths=[150, 280])
        feat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BG_CARD),
            ('TOPPADDING', (0, 0), (-1, -1), 10), ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(feat_table)
        elements.append(Spacer(1, 6))

    elements.append(PageBreak())

    # ===== SLIDE 6: NODE TYPES =====
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("Node Types", heading_style))
    elements.append(Paragraph("<font color='#3b82f6'>________</font>", body_style))
    elements.append(Spacer(1, 15))
    elements.append(Paragraph("13 built-in node types for building complex workflows:", body_style))
    elements.append(Spacer(1, 10))

    nodes = [
        ["Node", "Description", "Use Case"],
        ["Start / End", "Entry and exit points", "Workflow boundaries"],
        ["AI Step", "OpenAI/Anthropic integration", "Data analysis, content generation"],
        ["HTTP Request", "REST API calls", "External service integration"],
        ["Code", "JS/Python execution", "Custom logic, data processing"],
        ["Condition", "Conditional branching", "If/else logic paths"],
        ["Delay", "Time-based waiting", "Scheduling, rate limiting"],
        ["Transform", "Data transformation", "JSON manipulation, mapping"],
        ["Email", "Send email notifications", "Alerts, reports"],
        ["Notification", "Push notifications", "Real-time alerts"],
        ["Parallel", "Fork execution", "Concurrent processing"],
        ["Merge", "Join branches", "Result aggregation"],
        ["Webhook", "External trigger", "Event-driven workflows"],
    ]
    ns = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT), ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), BG_CARD), ('TEXTCOLOR', (0, 1), (-1, -1), TEXT_SECONDARY),
        ('FONTSIZE', (0, 1), (-1, -1), 9), ('GRID', (0, 0), (-1, -1), 1, HexColor("#334155")),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BG_CARD, PRIMARY]),
    ])
    nt = Table(nodes, colWidths=[90, 150, 190])
    nt.setStyle(ns)
    elements.append(nt)
    elements.append(PageBreak())

    # ===== SLIDE 7: TECH STACK =====
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("Tech Stack", heading_style))
    elements.append(Paragraph("<font color='#3b82f6'>________</font>", body_style))
    elements.append(Spacer(1, 20))

    tech_data = [
        ["CATEGORY", "TECHNOLOGY", "PURPOSE"],
        ["Runtime", "Node.js 20+", "Server runtime environment"],
        ["Language", "TypeScript", "Type-safe development"],
        ["Backend", "Express.js", "REST API framework"],
        ["ORM", "Prisma", "Database access layer"],
        ["Database", "SQLite / PostgreSQL", "Data persistence"],
        ["Queue", "BullMQ + Redis", "Job queue management"],
        ["Frontend", "React 18", "UI framework"],
        ["Bundler", "Vite", "Build tool and dev server"],
        ["Canvas", "React Flow", "Visual workflow editor"],
        ["Real-time", "Socket.IO", "WebSocket communication"],
        ["Scheduler", "node-cron", "Cron-based scheduling"],
        ["AI", "OpenAI SDK", "AI model integration"],
        ["Validation", "Zod", "Schema validation"],
        ["Logging", "Pino", "Structured logging"],
    ]
    ts = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT), ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BACKGROUND', (0, 1), (0, -1), BG_CARD), ('TEXTCOLOR', (0, 1), (0, -1), ACCENT_LIGHT),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1, 1), (1, -1), TEXT_PRIMARY), ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (2, 1), (2, -1), TEXT_SECONDARY), ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, HexColor("#334155")),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BG_CARD, PRIMARY]),
    ])
    tt = Table(tech_data, colWidths=[80, 120, 230])
    tt.setStyle(ts)
    elements.append(tt)
    elements.append(PageBreak())

    # ===== SLIDE 8: API ENDPOINTS =====
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("API Endpoints", heading_style))
    elements.append(Paragraph("<font color='#3b82f6'>________</font>", body_style))
    elements.append(Spacer(1, 15))
    elements.append(Paragraph("RESTful API with full CRUD operations:", body_style))
    elements.append(Spacer(1, 10))

    api_data = [
        ["METHOD", "ENDPOINT", "DESCRIPTION"],
        ["GET", "/api/health", "Health check"],
        ["GET", "/api/workflows", "List all workflows"],
        ["POST", "/api/workflows", "Create workflow"],
        ["GET", "/api/workflows/:id", "Get workflow detail"],
        ["PUT", "/api/workflows/:id", "Update workflow"],
        ["DELETE", "/api/workflows/:id", "Delete workflow"],
        ["POST", "/api/workflows/:id/run", "Execute workflow"],
        ["GET", "/api/workflows/:id/runs", "Get workflow runs"],
        ["POST", "/api/webhooks/:id", "Webhook trigger"],
        ["GET", "/api/schedules", "List schedules"],
        ["GET", "/api/events", "List events"],
    ]
    aps = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT), ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('TEXTCOLOR', (0, 1), (0, -1), SUCCESS), ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1, 1), (-1, -1), TEXT_SECONDARY), ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, HexColor("#334155")),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BG_CARD, PRIMARY]),
    ])
    apt = Table(api_data, colWidths=[60, 200, 180])
    apt.setStyle(aps)
    elements.append(apt)
    elements.append(PageBreak())

    # ===== SLIDE 9: DATABASE SCHEMA =====
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("Database Schema", heading_style))
    elements.append(Paragraph("<font color='#3b82f6'>________</font>", body_style))
    elements.append(Spacer(1, 15))
    elements.append(Paragraph("Prisma ORM with SQLite (dev) / PostgreSQL (prod):", body_style))
    elements.append(Spacer(1, 15))

    models = [
        ("Workflow", ACCENT, ["id, name, description, status", "triggerType (manual/schedule/webhook/event)", "nodes (JSON), edges (JSON), variables (JSON)", "version, createdAt, updatedAt"]),
        ("WorkflowRun", SUCCESS, ["id, workflowId (FK), status", "input (JSON), output (JSON), error", "nodeStates (JSON), startedAt, completedAt, duration"]),
        ("Schedule", WARNING, ["id, workflowId (FK), cron expression", "timezone, enabled, lastRun, nextRun"]),
        ("AuditLog", DANGER, ["id, action, resource, resourceId", "details (JSON), userId, ip, createdAt"]),
    ]
    for name, color, fields in models:
        elements.append(Paragraph(f"<font color='#{color.hexval()[2:]}'><b>{name}</b></font>", ParagraphStyle('MN', parent=body_style, fontSize=13, spaceAfter=5)))
        for f in fields:
            elements.append(Paragraph(f"  {f}", ParagraphStyle('MF', parent=body_style, fontSize=9, spaceAfter=2)))
        elements.append(Spacer(1, 10))

    elements.append(PageBreak())

    # ===== SLIDE 10: WORKFLOW EXAMPLE =====
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("Workflow Example", heading_style))
    elements.append(Paragraph("<font color='#3b82f6'>________</font>", body_style))
    elements.append(Spacer(1, 15))
    elements.append(Paragraph("<font color='#3b82f6'><b>Automated Data Pipeline</b></font>", ParagraphStyle('ET', parent=body_style, fontSize=14, spaceAfter=10)))
    elements.append(Spacer(1, 10))

    flow_data = [
        ["Start", ">>", "HTTP Request", ">>", "AI Step", ">>", "Condition", ">>", "End"],
        ["", "", "Fetch API data", "", "Analyze data", "", "If valid", "", "Done"],
        ["", "", "", "", "", "", "Else notify", "", ""],
    ]
    fts = TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), SUCCESS), ('BACKGROUND', (2, 0), (2, 0), ACCENT),
        ('BACKGROUND', (4, 0), (4, 0), INFO), ('BACKGROUND', (6, 0), (6, 0), WARNING),
        ('BACKGROUND', (8, 0), (8, 0), DANGER),
        ('TEXTCOLOR', (0, 0), (-1, 0), white), ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9), ('TEXTCOLOR', (1, 0), (1, 0), TEXT_SECONDARY),
        ('TEXTCOLOR', (3, 0), (3, 0), TEXT_SECONDARY), ('TEXTCOLOR', (5, 0), (5, 0), TEXT_SECONDARY),
        ('TEXTCOLOR', (7, 0), (7, 0), TEXT_SECONDARY), ('TEXTCOLOR', (0, 1), (-1, -1), TEXT_SECONDARY),
        ('FONTSIZE', (0, 1), (-1, -1), 8), ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ])
    ft = Table(flow_data, colWidths=[50, 20, 65, 20, 65, 20, 65, 20, 50])
    ft.setStyle(fts)
    elements.append(ft)
    elements.append(Spacer(1, 25))

    elements.append(Paragraph("<b>Use Cases:</b>", ParagraphStyle('UCT', parent=body_style, fontSize=12, textColor=TEXT_PRIMARY, spaceAfter=8)))
    for uc in [
        "Automated data extraction and transformation pipelines",
        "AI-powered content generation and review workflows",
        "Multi-step approval and notification systems",
        "Scheduled reporting and analytics automation",
        "Event-driven microservice orchestration",
    ]:
        elements.append(Paragraph(f"  {uc}", ParagraphStyle('UC', parent=body_style, fontSize=10, spaceAfter=5)))

    elements.append(PageBreak())

    # ===== SLIDE 11: DEPLOYMENT =====
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("Deployment", heading_style))
    elements.append(Paragraph("<font color='#3b82f6'>________</font>", body_style))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("GitHub Actions CI/CD Pipeline:", body_style))
    elements.append(Spacer(1, 10))

    deploy_data = [
        ["STAGE", "ACTION", "STATUS"],
        ["Build", "npm ci && npm run build", "Automated"],
        ["Test", "TypeScript type checking", "Automated"],
        ["Deploy", "GitHub Pages (frontend)", "Automated"],
        ["Backend", "Vercel / Railway / Render", "Manual"],
    ]
    ds = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT), ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('TEXTCOLOR', (2, 1), (2, 1), SUCCESS), ('FONTNAME', (2, 1), (2, 1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (-1, -1), TEXT_SECONDARY), ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, HexColor("#334155")),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BG_CARD, PRIMARY]),
    ])
    dt = Table(deploy_data, colWidths=[80, 220, 140])
    dt.setStyle(ds)
    elements.append(dt)
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("<b>Deployment Options:</b>", ParagraphStyle('DOT', parent=body_style, fontSize=12, textColor=TEXT_PRIMARY, spaceAfter=8)))
    for opt in [
        "GitHub Pages - Static frontend hosting (free)",
        "Vercel - Serverless backend deployment",
        "Railway - Full-stack hosting with database",
        "Render - Free tier for hobby projects",
        "DigitalOcean App Platform - Scalable cloud hosting",
    ]:
        elements.append(Paragraph(f"  {opt}", ParagraphStyle('DO', parent=body_style, fontSize=10, spaceAfter=5)))

    elements.append(PageBreak())

    # ===== SLIDE 12: ROADMAP =====
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("Roadmap", heading_style))
    elements.append(Paragraph("<font color='#3b82f6'>________</font>", body_style))
    elements.append(Spacer(1, 20))

    roadmap = [
        ("Phase 1 - Core (Current)", ACCENT, [
            "Visual workflow editor with drag-and-drop",
            "13 node types for building workflows",
            "Multi-trigger support (Manual, Cron, Webhook)",
            "REST API with full CRUD operations",
            "Real-time execution monitoring",
        ]),
        ("Phase 2 - Enhancement", SUCCESS, [
            "User authentication and role-based access",
            "Workflow versioning and rollback",
            "Advanced error handling and retry logic",
            "Workflow templates marketplace",
            "Webhook management dashboard",
        ]),
        ("Phase 3 - Intelligence", INFO, [
            "AI-powered workflow optimization",
            "Natural language workflow creation",
            "Predictive failure detection",
            "Auto-scaling execution engine",
            "Enterprise SSO integration",
        ]),
    ]

    for phase_title, color, items in roadmap:
        elements.append(Paragraph(f"<font color='#{color.hexval()[2:]}'><b>{phase_title}</b></font>", ParagraphStyle('PL', parent=body_style, fontSize=12, spaceAfter=5)))
        for item in items:
            elements.append(Paragraph(f"    {item}", ParagraphStyle('PI', parent=body_style, fontSize=9, spaceAfter=3)))
        elements.append(Spacer(1, 12))

    elements.append(PageBreak())

    # ===== SLIDE 13: THANK YOU =====
    elements.append(Spacer(1, 140))
    elements.append(Paragraph("<font color='#3b82f6' size='16'>####</font>", ParagraphStyle('TB', parent=body_style, alignment=TA_CENTER)))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Thank You", ParagraphStyle('TTY', parent=title_style, fontSize=36, alignment=TA_CENTER)))
    elements.append(Spacer(1, 15))
    elements.append(Paragraph("Intelligent Workflow Automation Agent", ParagraphStyle('TTS', parent=subtitle_style, alignment=TA_CENTER, fontSize=16)))
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("<font color='#3b82f6'>________________</font>", ParagraphStyle('TB2', parent=body_style, alignment=TA_CENTER)))
    elements.append(Spacer(1, 30))

    cs = ParagraphStyle('CS', parent=center_style, fontSize=12, textColor=TEXT_SECONDARY, spaceAfter=8)
    ls = ParagraphStyle('LS', parent=cs, fontSize=10, textColor=ACCENT_LIGHT)
    elements.append(Paragraph("GitHub", ls))
    elements.append(Paragraph("github.com/habiutomo/intelligent-workflow-automation-agent", cs))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("Live Demo", ls))
    elements.append(Paragraph("habiutomo.github.io/intelligent-workflow-automation-agent", cs))
    elements.append(Spacer(1, 50))
    elements.append(Paragraph("Questions?", ParagraphStyle('Q', parent=center_style, fontSize=18, textColor=TEXT_PRIMARY)))
    elements.append(Spacer(1, 80))
    elements.append(Paragraph("v1.0.0 | 2026", ParagraphStyle('F', parent=small_style, alignment=TA_CENTER)))

    doc.build(elements, onFirstPage=draw_bg, onLaterPages=draw_bg)
    print(f"PDF created: {output_path}")
    print(f"Location: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    create_presentation()
