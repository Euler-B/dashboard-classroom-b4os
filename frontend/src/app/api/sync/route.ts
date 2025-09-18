import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    // Execute the sync script
    const { stdout, stderr } = await execAsync('python3 backend/download_grades_supabase.py')
    
    if (stderr) {
      console.error('Sync script stderr:', stderr)
    }
    
    console.log('Sync script stdout:', stdout)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sincronización completada',
      output: stdout 
    })
    
  } catch (error) {
    console.error('Error running sync script:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error en la sincronización',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
