import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const rawBase = process.env.ADDRESS_KIT_BASE_URL || process.env.NEXT_PUBLIC_ADDRESS_KIT_BASE_URL || 'https://production.cas.so/address-kit/2025-07-01';
        const base = rawBase.replace(/\/+$/, '');
        const upstreamUrl = `${base}/provinces`;
        const res = await fetch(upstreamUrl, { headers: { Accept: 'application/json' } });
        if (!res.ok) {
            return NextResponse.json({ success: false, message: 'Upstream error', status: res.status }, { status: 502 });
        }
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Internal error';
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}
