<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>GAD Certificate - {{ $certificate_number }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 15mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #333;
            font-size: 11px;
            margin: 15mm;
        }
        
        .certificate {
            width: 100%;
            padding: 0;
            background: white;
        }

        /* Header Section */
        .header {
            text-align: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 15px;
            margin-bottom: 15px;
        }

        .header-title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }

        .header-subtitle {
            font-size: 12px;
            color: #7f8c8d;
            margin-bottom: 10px;
        }

        .certificate-id {
            font-size: 14px;
            font-weight: bold;
            color: #2980b9;
        }

        /* Sections */
        .section {
            margin-bottom: 12px;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: white;
            background-color: #34495e;
            padding: 5px 8px;
            margin-bottom: 8px;
            border-radius: 3px;
        }

        /* Project Information Section */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 12px;
            margin-bottom: 8px;
        }

        .info-row {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 8px;
            padding: 5px;
            background: #f8f9fa;
            border-radius: 2px;
        }

        .info-label {
            font-weight: bold;
            color: #2c3e50;
        }

        .info-value {
            color: #34495e;
        }

        /* Full-width row */
        .info-full {
            grid-column: 1 / -1;
        }

        /* Evaluation Results Summary */
        .score-summary {
            background: #ecf0f1;
            padding: 10px;
            border-radius: 3px;
            border-left: 4px solid #3498db;
            margin-bottom: 8px;
        }

        .score-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 5px;
        }

        .score-label {
            font-weight: bold;
            color: #2c3e50;
        }

        .score-value {
            font-weight: bold;
            color: #27ae60;
        }

        .interpretation-box {
            font-size: 12px;
            font-weight: bold;
            color: #2980b9;
            background: #d4efff;
            padding: 5px;
            border-radius: 2px;
            text-align: center;
        }

        /* Detailed Evaluations Table */
        .evaluations-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            margin-bottom: 8px;
        }

        .evaluations-table th {
            background: #34495e;
            color: white;
            font-weight: bold;
            padding: 5px;
            text-align: left;
            border: 1px solid #2c3e50;
        }

        .evaluations-table td {
            border: 1px solid #bdc3c7;
            padding: 5px;
            background: white;
        }

        .evaluations-table tbody tr:nth-child(even) td {
            background: #f8f9fa;
        }

        .evaluations-table tbody tr:hover td {
            background: #ecf0f1;
        }

        .category-cell {
            font-weight: bold;
            color: #2c3e50;
        }

        .question-cell {
            color: #555;
            padding-left: 15px;
        }

        .score-cell {
            text-align: center;
            font-weight: bold;
            color: #27ae60;
        }

        .remarks-cell {
            color: #7f8c8d;
            font-style: italic;
            font-size: 8px;
        }

        /* Score Interpretation Reference */
        .interpretation-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            margin-bottom: 8px;
        }

        .interpretation-table th,
        .interpretation-table td {
            border: 1px solid #bdc3c7;
            padding: 4px;
            text-align: left;
        }

        .interpretation-table th {
            background: #34495e;
            color: white;
            font-weight: bold;
        }

        .interpretation-table tr:nth-child(even) {
            background: #f8f9fa;
        }

        /* Signature Section */
        .signature-section {
            margin-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            page-break-inside: avoid;
        }

        .signature-block {
            text-align: center;
        }

        .signature-line {
            border-top: 2px solid #2c3e50;
            margin: 30px 0 5px 0;
            width: 100%;
        }

        .signature-name {
            font-weight: bold;
            color: #2c3e50;
            font-size: 11px;
            margin-top: 5px;
        }

        .signature-title {
            font-size: 10px;
            color: #7f8c8d;
            margin-top: 2px;
        }

        .issue-date {
            font-size: 9px;
            color: #95a5a6;
            margin-top: 3px;
        }

        /* Footer */
        .footer {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #bdc3c7;
            text-align: center;
            font-size: 9px;
            color: #95a5a6;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <!-- Header -->
        <div class="header">
            <div class="header-title">GENDER AND DEVELOPMENT CERTIFICATION</div>
            <div class="header-subtitle">Automated Gender and Development Evaluation System</div>
            <div class="certificate-id">Certificate No.: {{ $certificate_number }}</div>
        </div>

        <!-- Project Information Section -->
        <div class="section">
            <div class="section-title">PROJECT INFORMATION</div>
            <div class="info-grid">
                <div class="info-row">
                    <span class="info-label">Project Code:</span>
                    <span class="info-value">{{ $project_code }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Domain:</span>
                    <span class="info-value">{{ $domain }}</span>
                </div>
                <div class="info-row info-full">
                    <span class="info-label">Title:</span>
                    <span class="info-value">{{ $project_title }}</span>
                </div>
                <div class="info-row info-full">
                    <span class="info-label">Description:</span>
                    <span class="info-value">{{ $project_description }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Organization:</span>
                    <span class="info-value">{{ $organization }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Implementation Phase:</span>
                    <span class="info-value">{{ $phase }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Submission Date:</span>
                    <span class="info-value">{{ $submission_date }}</span>
                </div>
            </div>
        </div>

        <!-- Evaluation Results Summary -->
        <div class="section">
            <div class="section-title">EVALUATION RESULTS</div>
            <div class="score-summary">
                <div class="score-row">
                    <span class="score-label">Average Evaluation Score:</span>
                    <span class="score-value">{{ $average_score }}/{{ $max_score }}</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Number of Evaluators:</span>
                    <span class="score-value">{{ $evaluation_count }}</span>
                </div>
                <div style="margin-top: 5px;">
                    <div class="interpretation-box">{{ $interpretation }}</div>
                </div>
                @if($remarks)
                <div style="margin-top: 5px; padding: 5px; background: #fef5e7; border-radius: 2px; font-size: 10px;">
                    <strong>Remarks:</strong> {{ $remarks }}
                </div>
                @endif
            </div>
        </div>

        <!-- Individual Evaluations Table -->
        <div class="section">
            <div class="section-title">DETAILED EVALUATION RESULTS</div>
            <table class="evaluations-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Question</th>
                        <th style="width: 50px;">Score</th>
                        <th style="width: 100px;">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($evaluations as $eval_idx => $evaluation)
                        @php
                            $is_first_eval = true;
                            $eval_row_count = 0;
                            foreach($evaluation['scores_by_category'] as $category) {
                                $eval_row_count += count($category['items']);
                            }
                        @endphp
                        @foreach($evaluation['scores_by_category'] as $cat_idx => $category)
                            @php $is_first_category = true; @endphp
                            @foreach($category['items'] as $item_idx => $item)
                                <tr>
                                    @if($item_idx == 0)
                                        <td rowspan="{{ count($category['items']) }}" class="category-cell">{{ $category['category_name'] }}</td>
                                    @endif
                                    <td class="question-cell">{{ $item['question'] }}</td>
                                    <td class="score-cell">{{ number_format($item['score'], 2) }}</td>
                                    <td class="remarks-cell">{{ $item['remarks'] ?? '-' }}</td>
                                </tr>
                            @endforeach
                        @endforeach
                        @php $is_first_eval = false; @endphp
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Score Interpretation Reference -->
        <div class="section">
            <div class="section-title">SCORE INTERPRETATION REFERENCE</div>
            <table class="interpretation-table">
                <thead>
                    <tr>
                        <th>Interpretation</th>
                        <th>Score Range</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($interpretations as $interp)
                    <tr>
                        <td>{{ $interp['interpretation'] }}</td>
                        <td>{{ number_format($interp['min'], 0) }} - {{ number_format($interp['max'], 0) }}</td>
                        <td>{{ $interp['description'] ?? '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            @foreach($evaluator_names as $evaluator)
            <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-name">{{ $evaluator }}</div>
                <div class="signature-title">Project Evaluator</div>
            </div>
            @endforeach
            @if(count($evaluator_names) == 1)
            <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-name">{{ $issued_by }}</div>
                <div class="signature-title">Approving Officer</div>
                <div class="issue-date">{{ $issue_date }}</div>
            </div>
            @endif
        </div>

        @if(count($evaluator_names) > 1)
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; page-break-inside: avoid;">
            <div></div>
            <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-name">{{ $issued_by }}</div>
                <div class="signature-title">Approving Officer</div>
                <div class="issue-date">{{ $issue_date }}</div>
            </div>
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>This certificate is issued by the Gender and Development Office</p>
            <p>&copy; {{ date('Y') }} All rights reserved</p>
        </div>
    </div>
</body>
</html>