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
            background: transparent;
            position: relative;
            z-index: 0;
            min-height: 100%;
        }

        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            max-width: 1000px;
            z-index: 0;
            pointer-events: none;
        }

        .watermark img {
            width: 100%;
            height: auto;
            display: block;
        }

        .certificate-content {
            position: relative;
            z-index: 1;
            background: transparent;
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
            color: black;
            background-color:transparent;
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
            background: transparent;
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
            background: #transparent;
            padding: 10px;
            border-radius: 3px;
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
            background: transparent;
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
            background: transparent;
            color: #2c3e50;
            font-weight: bold;
            padding: 5px;
            text-align: left;
            border: 1px solid #bdc3c7;
        }

        .evaluations-table td {
            border: 1px solid #bdc3c7;
            padding: 5px;
            background: transparent;
        }

        .evaluations-table tbody tr:nth-child(even) td {
            background: transparent;
        }

        .evaluations-table tbody tr:hover td {
            background: transparent;
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
            background: transparent;
            color: #2c3e50;
            font-weight: bold;
        }

        .interpretation-table tr:nth-child(even) {
            background: transparent;
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
    <div class="watermark">
        <img src="{{ public_path('images/Watermark-GAD_Logo.png') }}" alt="GAD watermark">
    </div>

    <div class="certificate">
        <div class="certificate-content">
        <!-- Header -->
        <div class="header">
            <div class="header-title">GENDER AND DEVELOPMENT CERTIFICATION</div>
            <div class="header-subtitle">Automated Gender and Development Evaluation System</div>
            <div class="certificate-id">Certificate No.: {{ preg_match('/\d{4}$/', (string) $certificate_number, $matches) ? substr((string) $certificate_number, 0, -4) . str_repeat('*', 4) : $certificate_number }}</div>
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
                    <span class="info-label">Cluster:</span>
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
                        <td>{{ number_format($interp['min'], 2) }} - {{ number_format($interp['max'], 2) }}</td>
                        <td>{{ $interp['description'] ?? '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <table style="width: 100%; border-collapse: collapse; page-break-inside: avoid;">
                <!-- Domain Evaluators -->
                <tr>
                    @foreach($domain_evaluators as $evaluator)
                    <td style="width: 50%; text-align: center; padding: 20px 10px; vertical-align: top;">
                        <div style="border-top: 2px solid #2c3e50; margin-bottom: 8px;"></div>
                        <div style="font-weight: bold; font-size: 11px; color: #2c3e50; margin-top: 2px;">{{ $evaluator['name'] }}</div>
                        <div style="font-size: 10px; color: #7f8c8d;">Cluster Evaluator</div>
                    </td>
                    @if($loop->iteration % 2 == 0)
                    </tr><tr>
                    @endif
                    @endforeach
                    @if(count($domain_evaluators) % 2 != 0)
                    <td style="width: 50%;"></td>
                    @endif
                </tr>

                <!-- Approving Officers -->
                <tr>
                    @foreach($admin_signatures as $admin)
                    <td style="width: 50%; text-align: center; padding: 20px 10px; vertical-align: top;">
                        <div style="border-top: 2px solid #2c3e50; margin-bottom: 8px;"></div>
                        <div style="font-weight: bold; font-size: 11px; color: #2c3e50; margin-top: 2px;">{{ $admin['name'] }}</div>
                        <div style="font-size: 10px; color: #7f8c8d;">Approving Officer</div>
                    </td>
                    @if($loop->iteration % 2 == 0)
                    </tr><tr>
                    @endif
                    @endforeach
                    @if(count($admin_signatures) % 2 != 0)
                    <td style="width: 50%;"></td>
                    @endif
                </tr>

                <!-- Issue Date -->
                <tr>
                    <td colspan="2" style="text-align: center; padding: 10px;">
                        <div style="font-size: 9px; color: #34495e;">{{ $issue_date }}</div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This certificate is issued by the Gender and Development Office</p>
            <p>&copy; {{ date('Y') }} All rights reserved</p>
        </div>
        </div>
    </div>
</body>
</html>