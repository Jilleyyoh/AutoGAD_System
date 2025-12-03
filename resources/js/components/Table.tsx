import React from 'react';

interface Column {
    key: string;
    label: string;
    render?: (item: any) => React.ReactNode;
}

interface Props {
    data: any[];
    columns: Column[];
}

export default function Table({ data, columns }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map((item, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column) => (
                                <td
                                    key={`${rowIndex}-${column.key}`}
                                    className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                                >
                                    {column.render
                                        ? column.render(item)
                                        : item[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}