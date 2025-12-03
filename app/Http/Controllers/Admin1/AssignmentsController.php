$projects = Project::where('status', '>=', 1)
    ->where('status', '<=', 7)
    ->with(['proponent.organization', 'domainExpertise', 'implementationPhase', 'evaluator'])
    ->when($status, function ($query) use ($status) {
        return $query->where('status', $status);
    })
    ->when($from, function ($query) use ($from) {
        return $query->whereDate('submission_date', '>=', $from);
    })
    ->when($to, function ($query) use ($to) {
        return $query->whereDate('submission_date', '<=', $to);
    })
    ->orderBy('submission_date', 'desc')
    ->get();