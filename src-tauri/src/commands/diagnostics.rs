use log::LevelFilter;

/// Raise/lower the process log level for the current session. Verbose is never
/// persisted — startup always re-establishes `Info` (see lib.rs setup).
#[tauri::command]
pub fn set_verbose_logging(enabled: bool) {
    log::set_max_level(if enabled {
        LevelFilter::Debug
    } else {
        LevelFilter::Info
    });
}
