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
            color: #431148;
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
            color: #431148;
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
            color: black;
            font-size: 13px;
        }

        .info-value {
            color: black;
            font-size: 13px;
        }

        /* Full-width row */
        .info-full {
            grid-column: 1 / -1;
        }

        /* Evaluation Results Summary */
        .score-summary {
            background: #transparent;
            padding: 5px;
            border-radius: 3px;
            margin-bottom: 8px;
        }

        .score-row {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 20px;
            margin-bottom: 5px;
        }

        .score-label {
            font-weight: bold;
            color: black;
            font-size: 13px;
        }

        .score-value {
            font-weight: bold;
            color: black;
            font-size: 13px;
        }

        .interpretation-box {
            font-size: 13px;
            font-weight: bold;
            color: #2980b9;
            background: transparent;
            padding: 5px;
            border-radius: 2px;
            text-align: center;
        }

        /* Signature Section */
        .signature-section {
            margin-top: 20px;
            page-break-inside: avoid;
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

        .category-score-cell {
            text-align: center;
            font-weight: bold;
            color: #2c3e50;
        }

        .score-cell {
            text-align: center;
            font-weight: normal;
            color: #2c3e50;
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

        .interpretation-table th:first-child,
        .interpretation-table td:first-child {
            width: 80px;
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
            <div class="header-title">GENDER MAINSTREAMING REVIEW FORM</div>
            <div class="header-subtitle">Gender-Inclusive Knowledge Management System</div>
        </div>

        <!-- Project Information Section -->
        <div class="section">
            <div class="info-grid" style="grid-template-columns: 1fr;">
                <div class="info-row" style="grid-template-columns: 1fr;">
                    <span class="info-label">Title:</span>
                    <span class="info-value" style="font-weight: bold; font-size: 14px;">{{ $project_title }}</span>
                </div>
                <div class="info-row" style="grid-template-columns: 1fr;">
                    <span class="info-label">Proponent:</span>
                    <span class="info-value">{{ $proponent_name }}</span>
                </div>
                <div class="info-row" style="grid-template-columns: 1fr;">
                    <span class="info-label">Organization:</span>
                    <span class="info-value">{{ $organization }}</span>
                </div>
                <div class="info-row" style="grid-template-columns: 1fr;">
                    <span class="info-label">Description:</span>
                    <span class="info-value">{{ $project_description }}</span>
                </div>
            </div>
        </div>

        <!-- Evaluation Results Summary -->
        <div class="section">
            <div class="score-summary" style="padding: 5px;">
                <div class="score-row" style="grid-template-columns: 140px 1fr; gap: 60px;">
                    <span>
                        <span class="score-label">Score:</span>
                        <span class="score-value">{{ $average_score }}/{{ $max_score }}</span>
                    </span>
                    <span>
                        <span class="score-label">Remarks:</span>
                        <span style="font-size: 13px;">{{ $interpretation }}</span>
                    </span>
                </div>
            </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <h3 style="font-size: 12px; font-weight: bold; color: black; margin-bottom: 10px;">
                REVIEWED BY THE COMMITTEE:
            </h3>
            <table style="width: 100%; border-collapse: collapse; page-break-inside: avoid;">
                <tbody>
                    <!-- Domain Evaluators -->
                    @foreach($domain_evaluators as $evaluator)
                    <tr>
                        <td style="width: 25%; padding: 10px 8px; font-size: 10px; color: black;">Evaluator</td>
                        <td style="width: 35%; padding: 10px 8px; font-size: 13px; font-weight: bold; color: black;">{{ $evaluator['name'] }}</td>
                        <td style="width: 40%; padding: 10px 8px;">
                            <div style="border-bottom: 1px solid #2c3e50; width: 80%; height: 20px;"></div>
                        </td>
                    </tr>
                    @endforeach

                    <!-- Approving Officers -->
                    @foreach($admin_signatures as $admin)
                    <tr>
                        <td style="width: 25%; padding: 10px 8px; font-size: 10px; color: black;">Approving Officer</td>
                        <td style="width: 35%; padding: 10px 8px; font-size: 13px; font-weight: bold; color: black;">{{ $admin['name'] }}</td>
                        <td style="width: 40%; padding: 10px 8px;">
                            <div style="border-bottom: 1px solid #2c3e50; width: 80%; height: 20px;"></div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <!-- Issue Date -->
            <div style="text-align: left; padding: 10px; margin-top: 10px;">
                <div style="font-size: 13px; font-weight: bold; color: black;">Issue Date: {{ $issue_date }}</div>
            </div>
        </div>

        <!-- Individual Evaluations Table -->
        <div class="section" style="page-break-before: always;">
            
            <div class="info-row" style="margin-bottom: 15px;">
                <span class="info-label">Title:</span>
                <span class="info-value" style="font-weight: bold; font-size: 13px;">
                    {{ $project_title }}
                </span>
            </div>

            <table class="evaluations-table">
                <thead>
                    <tr>
                        <th>Questionnaire</th>
                        <th style="width: 60px;">Score</th>
                        <th style="width: 120px;">Remarks</th>
                    </tr>
                </thead>

                <tbody>
                    @foreach($evaluations as $evaluation)

                        @foreach($evaluation['scores_by_category'] as $category)

                            {{-- Category Row --}}
                            <tr style="background-color: #f5f5f5; font-weight: bold;">
                                <td class="category-cell">
                                    {{ $category['category_name'] }}
                                </td>

                                <td class="category-score-cell">
                                    {{ number_format($category['subtotal'], 2) }}
                                </td>

                                <td class="remarks-cell">
                                    -
                                </td>
                            </tr>

                            {{-- Question Rows --}}
                            @foreach($category['items'] as $item)
                                <tr>
                                    <td class="question-cell" style="padding-left: 20px;">
                                        {{ $item['question'] }}
                                    </td>

                                    <td class="score-cell">
                                        {{ number_format($item['score'], 2) }}
                                    </td>

                                    <td class="remarks-cell">
                                        {{ $item['remarks'] ?? '-' }}
                                    </td>
                                </tr>
                            @endforeach

                        @endforeach

                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Score Interpretation Reference -->
        <div class="section">
            <div class="section-title">Interpretation of the GAD Score</div>
            <table class="interpretation-table">
                <thead>
                    <tr>
                        <th>Score Range</th>
                        <th>Interpretation</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($interpretations as $interp)
                    <tr>
                        <td>{{ number_format($interp['min'], 2) }} - {{ number_format($interp['max'], 2) }}</td>
                        <td>{{ $interp['interpretation'] }}</td>
                        <td>{{ $interp['description'] ?? '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Certification Page (always last) -->
        <div style="page-break-before: always;">
            <div class="certificate-content">

             <!-- Header -->
            <div class="header">
                <div class="header-title">GENDER AND DEVELOPMENT</div>
                <div class="header-subtitle">Gender-Inclusive Knowledge Management System</div>
                <div class="certificate-id">Certificate No.: {{ preg_match('/\d{4}$/', (string) $certificate_number, $matches) ? substr((string) $certificate_number, 0, -4) . str_repeat('*', 4) : $certificate_number }}</div>
            </div>

                <div style="text-align: center; margin-top: 60px; margin-bottom: 40px;">
                    <h1 style="font-size: 22px; font-weight: bold; letter-spacing: 8px; color: black;">
                        C E R T I F I C A T I O N
                    </h1>
                </div>

                <div style="font-size: 13px; line-height: 1.8; color: black; text-align: justify; padding: 0 10px;">
                    <p style="margin-bottom: 15px;">
                        This is to certify that the undersigned Committee reviewed and evaluated the submission
                        "<strong>{{ $project_title }}</strong>" submitted by <strong>{{ $proponent_name }}</strong>
                        of <strong>{{ $organization }}</strong>, under the Gender and Development (GAD) of the
                        University of Southeastern Philippines.
                    </p>

                    <p style="margin-bottom: 15px;">
                        This is to certify further that the undersigned Committee assessed the submission based on
                        the established GAD evaluation criteria and determined that it obtained an average score of
                        <strong>{{ $average_score }}/{{ $max_score }}</strong>, with an interpretation of
                        <strong>{{ $interpretation }}</strong>
                    </p>

                    <p style="margin-bottom: 15px;">
                        This certification further ensures that the submitted materials adopt gender-responsive and
                        inclusive principles, in accordance with the standards practiced by the University.
                    </p>

                    <p style="margin-bottom: 40px;">
                        Issued on the <strong>{{ $issue_date }}</strong> at the University of Southeastern Philippines,
                        Iñigo St., Bo. Obrero, Davao City.
                    </p>
                </div>

                <!-- Signatory -->
                <div style="margin-top: 60px; text-align: left;">
                    <div style="width: 250px; margin-left: 10px;">
                        <div style="border-bottom: 1px solid black; height: 20px; margin-bottom: 8px;"></div>
                        <div style="font-weight: bold; font-size: 13px; color: black;">GENESESLY R. TAHOY</div>
                        <div style="font-size: 11px; color: black;">GAD Director</div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p>This certificate is issued by the Gender and Development Office</p>
                    <p>&copy; {{ date('Y') }} All rights reserved</p>
                </div>
            </div>
        </div>

        </div>
    </div>
</body>
</html>