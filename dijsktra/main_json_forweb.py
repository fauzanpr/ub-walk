import os
import sys
import json
import subprocess


def main():
    base = os.path.dirname(os.path.abspath(__file__))

    main_json_path = os.path.join(base, 'main_json.py')
    output_path = os.path.join(base, 'output.json')

    print('=== main_json_forweb.py DEBUG ===')
    print('BASE DIR:', base)
    print('MAIN JSON PATH:', main_json_path)
    print('OUTPUT PATH:', output_path)
    print('ARGS:', sys.argv)

    if len(sys.argv) < 3:
        print('Usage: python main_json_forweb.py <source_id> <destination_id>')
        sys.exit(1)

    source_id = sys.argv[1].strip()
    destination_id = sys.argv[2].strip()

    print('SOURCE ID:', source_id)
    print('DESTINATION ID:', destination_id)

    # Hapus output lama supaya tidak terbaca lagi
    if os.path.exists(output_path):
        print('Menghapus output.json lama...')
        os.remove(output_path)

    input_data = f'{source_id}\n{destination_id}\n'

    process = subprocess.run(
        [sys.executable, main_json_path],
        input=input_data,
        text=True,
        cwd=base,
        capture_output=True
    )

    print('=== STDOUT dari main_json.py ===')
    print(process.stdout)

    print('=== STDERR dari main_json.py ===')
    print(process.stderr)

    print('RETURN CODE:', process.returncode)

    if process.returncode != 0:
        print('main_json.py gagal dijalankan', file=sys.stderr)
        sys.exit(process.returncode)

    if not os.path.exists(output_path):
        print(
            'output.json tidak dibuat. Kemungkinan node tidak valid atau rute tidak ditemukan.',
            file=sys.stderr
        )
        sys.exit(1)

    with open(output_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print('=== ISI OUTPUT BARU ===')
    print(json.dumps(data, indent=2))

    print(f'Output saved to: {output_path}')


if __name__ == '__main__':
    main()