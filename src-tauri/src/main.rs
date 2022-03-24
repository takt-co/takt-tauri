#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{Manager, SystemTray, SystemTrayEvent, Position, PhysicalPosition};

fn main() {
  let tray = SystemTray::new();

  tauri::Builder::default()
    .system_tray(tray)
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::LeftClick {
        position,
        size: _,
        ..
      } => {
        let window = app.get_window("main").unwrap();

        if window.is_visible().unwrap() {
          window.hide().unwrap();
        } else {
          window.show().unwrap();
          window.set_focus().unwrap();
          window.set_position(
            Position::Physical(
              PhysicalPosition {
                x: (position.x as i32) - 270,
                y: position.y as i32
              }
            )
          ).unwrap();
        }
      }
      _ => {}
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
